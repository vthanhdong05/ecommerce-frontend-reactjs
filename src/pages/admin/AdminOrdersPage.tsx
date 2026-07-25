import { useEffect, useState, type ReactNode } from 'react';
import { Search, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useToast } from '../../hooks/toastContext';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { usePermission } from '../../hooks/usePermission';
import { formatVND } from '../../utils/formatCurrency';
import type { Order, OrderStatus } from '../../types/admin.types';
import { cancelOrder, getOrderById, getOrders } from '../../api/admin/orders.api';

const STATUS_TONE: Record<OrderStatus, 'gray' | 'blue' | 'yellow' | 'green' | 'red' | 'purple'> = {
  pending: 'gray',
  confirmed: 'blue',
  shipping: 'yellow',
  delivered: 'green',
  cancelled: 'red',
  returned: 'purple',
};

export function AdminOrdersPage() {
  const { showToast } = useToast();
  const canCancel = usePermission(PERM.update(ROUTES.orderDetail));

  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');

  const [detail, setDetail] = useState<Order | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [confirmCancel, setConfirmCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const pageCount = Math.max(1, Math.ceil(totalCount / itemPerPage));

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getOrders({
        page,
        itemPerPage,
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentFilter }),
      });
      setData(res.items ?? []);
      setTotalCount(res.meta?.totalCount ?? 0);
    } catch {
      setData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on filter change
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load reads current page/itemPerPage/statusFilter/paymentFilter via closure
  }, [page, itemPerPage, statusFilter, paymentFilter]);

  const openDetail = async (o: Order) => {
    setIsLoadingDetail(true);
    try {
      const full = await getOrderById(o.id);
      setDetail(full);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tải được chi tiết';
      showToast(msg, 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetail = () => setDetail(null);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    setIsCancelling(true);
    try {
      await cancelOrder(confirmCancel.id);
      showToast('Đã hủy đơn hàng.', 'success');
      setConfirmCancel(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Hủy đơn thất bại';
      showToast(msg, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'id',
      header: 'Mã đơn',
      className: 'w-32',
      cell: (o) => <code className="text-xs">{o.id.slice(0, 8)}…</code>,
    },
    {
      key: 'totalAmount',
      header: 'Tổng tiền',
      className: 'w-32 text-right',
      cell: (o) => <span className="font-semibold">{formatVND(parseFloat(o.totalAmount))}</span>,
    },
    {
      key: 'paymentStatus',
      header: 'Thanh toán',
      className: 'w-32',
      cell: (o) => (
        <StatusBadge
          label={o.paymentStatus}
          tone={
            o.paymentStatus === 'paid' ? 'green' : o.paymentStatus === 'failed' ? 'red' : 'gray'
          }
        />
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-32',
      cell: (o) => <StatusBadge label={o.status} tone={STATUS_TONE[o.status]} />,
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      className: 'w-44',
      cell: (o) => new Date(o.createdAt).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Đơn hàng (chỉ xem & hủy — tạo mới qua giao diện người dùng).
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Trạng thái đơn">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | '');
                setPage(1);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Tất cả</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipping">Shipping</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </FormField>
          <FormField label="Thanh toán">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Tất cả</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </FormField>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={data}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        pagination={{ page, itemPerPage, pageCount, totalCount }}
        onPageChange={setPage}
        onItemPerPageChange={(n) => {
          setItemPerPage(n);
          setPage(1);
        }}
        rowActions={(o) => (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openDetail(o)}
              aria-label="Xem chi tiết"
            >
              <Search className="w-4 h-4" />
            </Button>
            {canCancel && o.status !== 'cancelled' && o.status !== 'delivered' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmCancel(o)}
                aria-label={`Hủy đơn ${o.id}`}
              >
                <XCircle className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </>
        )}
      />

      <Modal
        open={!!detail}
        onClose={closeDetail}
        title="Chi tiết đơn hàng"
        size="lg"
        footer={
          <Button variant="secondary" onClick={closeDetail}>
            Đóng
          </Button>
        }
      >
        {isLoadingDetail ? (
          <p className="text-sm text-gray-500">Đang tải…</p>
        ) : detail ? (
          <div className="space-y-2 text-sm">
            <Row label="Mã đơn" value={<code>{detail.id}</code>} />
            <Row label="User" value={detail.userID} />
            <Row label="Vendor" value={detail.vendorID ?? '—'} />
            <Row label="Tổng tiền" value={formatVND(parseFloat(detail.totalAmount))} />
            <Row label="Phương thức TT" value={detail.paymentMethod} />
            <Row
              label="Trạng thái TT"
              value={
                <StatusBadge
                  label={detail.paymentStatus}
                  tone={
                    detail.paymentStatus === 'paid'
                      ? 'green'
                      : detail.paymentStatus === 'failed'
                        ? 'red'
                        : 'gray'
                  }
                />
              }
            />
            <Row
              label="Trạng thái"
              value={<StatusBadge label={detail.status} tone={STATUS_TONE[detail.status]} />}
            />
            <Row label="Địa chỉ" value={detail.shippingAddressID ?? '—'} />
            <Row label="Ghi chú" value={detail.note ?? '—'} />
            <Row label="Tạo lúc" value={new Date(detail.createdAt).toLocaleString('vi-VN')} />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!confirmCancel}
        title="Hủy đơn hàng"
        message={`Bạn có chắc muốn hủy đơn ${confirmCancel?.id}?`}
        tone="danger"
        isLoading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(null)}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1 border-b border-gray-100 last:border-0">
      <span className="w-32 text-gray-500 shrink-0">{label}</span>
      <span className="flex-1 text-gray-900">{value}</span>
    </div>
  );
}

export default AdminOrdersPage;
