import prisma from '@/client';

export async function GET(request: Request) {
  void request;
  try {
    const db = prisma as any;
    const unprocessedReceiptItems = await db.receiptItem.findMany({
      where: {
        isInventoryProcessed: false,
        isdeleted: false,
        receipt: {
          isdeleted: false,
        },
        item: {
          isdeleted: false,
          unit: {
            isdeleted: false,
          },
          category: {
            isdeleted: false,
          },
        },
      },
      select: {
        receipt_id: true,
        item_id: true,
      },
    });

    if (unprocessedReceiptItems.length === 0) {
      return Response.json({ success: true, data: [] });
    }

    const transactions = await db.itemTransaction.findMany({
      where: {
        isdeleted: false,
        OR: unprocessedReceiptItems.map((item: any) => ({
          receipt_id: item.receipt_id,
          item_id: item.item_id,
        })),
      },
      orderBy: { transaction_date: 'desc' },
      select: {
        transaction_id: true,
        transaction_date: true,
        quantity: true,
        receipt_id: true,
        item: {
          select: {
            item_id: true,
            item_name: true,
            unit: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Group by transaction_id
    const grouped = new Map<string, { transaction_id: string; transaction_date: Date; items: any[] }>();
    for (const tx of transactions as any[]) {
      const key = tx.transaction_id as string;
      if (!grouped.has(key)) {
        grouped.set(key, {
          transaction_id: key,
          transaction_date: tx.transaction_date,
          items: [],
        });
      }
      const bucket = grouped.get(key)!;
      // Optionally keep the most recent date per transaction_id
      if (tx.transaction_date > bucket.transaction_date) {
        bucket.transaction_date = tx.transaction_date;
      }
      bucket.items.push({
        receipt_id: tx.receipt_id,
        item_id: tx.item.item_id,
        item_name: tx.item.item_name,
        item_unit: tx.item.unit.name,
        quantity: parseFloat(tx.quantity.toString()),
      });
    }

    const formatted = Array.from(grouped.values()).sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1));
    return Response.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch inventory transactions' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { items, transaction_ids } = body ?? {};
    const db = prisma as any;

    // Prefer item-level updates when provided
    if (Array.isArray(items)) {
      if (items.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'items array cannot be empty' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Validate structure
      const invalid = items.find(
        (x: any) =>
          !x || typeof x !== 'object' || typeof x.receipt_id !== 'string' || typeof x.item_id !== 'string',
      );
      if (invalid) {
        return new Response(
          JSON.stringify({ success: false, error: 'Each item must have string receipt_id and item_id' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Deduplicate pairs to avoid redundant updates
      const key = (r: string, i: string) => `${r}::${i}`;
      const uniqueMap = new Map<string, { receipt_id: string; item_id: string }>();
      for (const it of items as Array<{ receipt_id: string; item_id: string }>) {
        uniqueMap.set(key(it.receipt_id, it.item_id), { receipt_id: it.receipt_id, item_id: it.item_id });
      }
      const uniqueItems = Array.from(uniqueMap.values());

      // Verify existence and active state
      const existing = await db.receiptItem.findMany({
        where: {
          isdeleted: false,
          OR: uniqueItems.map((it) => ({ receipt_id: it.receipt_id, item_id: it.item_id })),
          receipt: { isdeleted: false },
          item: { isdeleted: false },
        },
        select: { receipt_id: true, item_id: true },
      });

      const existingKeys = new Set(existing.map((e: any) => key(e.receipt_id, e.item_id)));
      const missing = uniqueItems.filter((it) => !existingKeys.has(key(it.receipt_id, it.item_id)));
      if (missing.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Some items were not found or are deleted',
            missing_items: missing,
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const updateOps = uniqueItems.map((it) =>
        db.receiptItem.update({
          where: { receipt_id_item_id: { receipt_id: it.receipt_id, item_id: it.item_id } },
          data: { isInventoryProcessed: true },
        }),
      );

      await prisma.$transaction(updateOps);

      return Response.json({
        success: true,
        message: `Marked ${uniqueItems.length} item(s) as inventory processed`,
        processed_items: uniqueItems,
      });
    }

    // Backward compatibility: allow transaction_ids updates (group-level)
    if (!Array.isArray(transaction_ids) || transaction_ids.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Provide items array for item-level updates or a non-empty transaction_ids array',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!transaction_ids.every((id: unknown) => typeof id === 'string')) {
      return new Response(
        JSON.stringify({ success: false, error: 'All transaction_ids must be strings' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const transactions = await db.itemTransaction.findMany({
      where: {
        transaction_id: { in: transaction_ids },
        isdeleted: false,
        receipt: { isdeleted: false },
      },
      select: { transaction_id: true, item_id: true, receipt_id: true },
    });

    const foundIds = new Set(transactions.map((tx: any) => tx.transaction_id));
    const missingIds = transaction_ids.filter((id: string) => !foundIds.has(id));

    if (missingIds.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: `Transaction IDs not found: ${missingIds.join(', ')}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const validTransactions = transactions.filter((tx: any) => tx.receipt_id);
    if (validTransactions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid receipt transactions found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const updateOps = validTransactions.map((tx: any) =>
      db.receiptItem.update({
        where: {
          receipt_id_item_id: {
            receipt_id: tx.receipt_id!,
            item_id: tx.item_id,
          },
        },
        data: { isInventoryProcessed: true },
      }),
    );

    await prisma.$transaction(updateOps);

    return Response.json({
      success: true,
      message: `Marked ${validTransactions.length} item(s) from ${transaction_ids.length} transaction(s) as inventory processed`,
      processed_transaction_ids: Array.from(foundIds),
    });
  } catch (error) {
    console.error('Error updating inventory processed status:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to update inventory processed status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
