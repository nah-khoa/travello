import { useEffect, useState } from 'react';
import './admin-utility-pages.css';
import {
  loadAdminPaymentData,
  saveAdminPaymentData,
} from '../../../shared/services/adminTransportData';

export default function PaymentRefundManagement() {
  const storedPaymentData = loadAdminPaymentData({
    transactions: null,
    refunds: null,
  });
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTx, setSearchTx] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [selectedGatewayLog, setSelectedGatewayLog] = useState(null);

  const [transactions, setTransactions] = useState(storedPaymentData.transactions || [
    {
      id: 'TXN-99201',
      bookingId: 'BK-FL8821',
      customer: 'Nguyễn Văn An',
      service: 'Máy bay',
      amount: 2450000,
      method: 'VNPAY',
      time: '03/11/2026 09:15:22',
      paymentStatus: 'SUCCESS',
      bookingStatus: 'CONFIRMED',
      isSandbox: false,
      anomaly: null,
      gatewayResponse: {
        vnp_ResponseCode: '00',
        vnp_TransactionStatus: '00',
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: 'VNP14289102',
        signatureVerified: true,
        message: 'Giao dịch thành công - Đã xác minh chữ ký số HMAC-SHA512'
      }
    },
    {
      id: 'TXN-99202',
      bookingId: 'BK-BS1044',
      customer: 'Trần Thị Bích',
      service: 'Xe khách',
      amount: 650000,
      method: 'MOMO',
      time: '03/11/2026 10:02:11',
      paymentStatus: 'SUCCESS',
      bookingStatus: 'PENDING_PAYMENT',
      isSandbox: false,
      anomaly: 'INCONSISTENT',
      gatewayResponse: {
        resultCode: 0,
        transId: 'MOMO99812341',
        webhookStatus: 'TIMEOUT_ON_CALLBACK',
        signatureVerified: true,
        note: 'Cổng MoMo đã trừ tiền nhưng callback cập nhật Booking bị trễ.'
      }
    },
    {
      id: 'TXN-99203',
      bookingId: 'BK-FL8821',
      customer: 'Nguyễn Văn An',
      service: 'Máy bay',
      amount: 2450000,
      method: 'VNPAY',
      time: '03/11/2026 09:15:45',
      paymentStatus: 'SUCCESS',
      bookingStatus: 'CONFIRMED',
      isSandbox: false,
      anomaly: 'DUPLICATE',
      gatewayResponse: {
        vnp_ResponseCode: '00',
        vnp_BankTranNo: 'VNP14289189',
        signatureVerified: true,
        warning: 'Phát hiện thanh toán trùng lặp lần 2 cho cùng mã BK-FL8821'
      }
    },
    {
      id: 'TXN-99204',
      bookingId: 'BK-TR5509',
      customer: 'Lê Hoàng Nam',
      service: 'Tàu hỏa',
      amount: 890000,
      method: 'ZALOPAY',
      time: '03/11/2026 11:20:00',
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING_PAYMENT',
      isSandbox: true,
      anomaly: null,
      gatewayResponse: {
        return_code: 3,
        return_message: 'Đang chờ khách hàng xác nhận thanh toán trên môi trường Sandbox',
        environment: 'SANDBOX_DEV'
      }
    },
    {
      id: 'TXN-99205',
      bookingId: 'BK-FL9012',
      customer: 'Phạm Minh Tuấn',
      service: 'Máy bay',
      amount: 3200000,
      method: 'CREDIT_CARD',
      time: '02/11/2026 21:40:10',
      paymentStatus: 'FAILED',
      bookingStatus: 'CANCELLED',
      isSandbox: false,
      anomaly: null,
      gatewayResponse: {
        error_code: 'INSUFFICIENT_FUNDS',
        decline_reason: 'Thẻ không đủ hạn mức giao dịch'
      }
    }
  ]);

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [refunds, setRefunds] = useState(storedPaymentData.refunds || [
    {
      refundId: 'RF-5001',
      bookingId: 'BK-FL8821',
      txId: 'TXN-99203',
      customer: 'Nguyễn Văn An',
      paidAmount: 2450000,
      refundAmount: 2450000,
      reason: 'Khách hàng bị trừ tiền 2 lần (Giao dịch trùng lặp TXN-99203)',
      policyCheck: 'Đủ điều kiện hoàn 100% (Lỗi giao dịch trùng lặp đã xác minh từ cổng thanh toán)',
      isEligible: true,
      status: 'PENDING_APPROVAL',
      refCode: 'Chưa cấp',
      history: [
        { time: '03/11/2026 09:30', actor: 'Hệ thống Đối soát', action: 'Tự động khởi tạo yêu cầu hoàn tiền do trùng lặp' }
      ]
    },
    {
      refundId: 'RF-5002',
      bookingId: 'BK-TR4410',
      txId: 'TXN-98112',
      customer: 'Đỗ Thu Hà',
      paidAmount: 1200000,
      refundAmount: 960000,
      reason: 'Khách chủ động hủy vé tàu trước giờ khởi hành 48 giờ',
      policyCheck: 'Đúng chính sách: Hủy trước 24h khấu trừ phí 20%, hoàn lại 80% giá trị vé',
      isEligible: true,
      status: 'PROCESSING',
      refCode: 'VNP-RF-882910',
      history: [
        { time: '02/11/2026 15:05', actor: 'Quản trị viên', action: 'Đã phê duyệt hoàn 960.000 VNĐ (Mã tham chiếu: VNP-RF-882910)' }
      ]
    },
    {
      refundId: 'RF-5003',
      bookingId: 'BK-FL7719',
      txId: 'TXN-97990',
      customer: 'Vũ Đình Trọng',
      paidAmount: 1850000,
      refundAmount: 0,
      reason: 'Khách yêu cầu hủy vé hạng Tiết kiệm trước giờ bay 2 tiếng',
      policyCheck: 'Không đủ điều kiện: Hạng vé khuyến mãi không hỗ trợ hoàn hủy dưới 24h',
      isEligible: false,
      status: 'PENDING_APPROVAL',
      refCode: 'Chưa cấp',
      history: [
        { time: '03/11/2026 08:10', actor: 'Khách hàng', action: 'Gửi yêu cầu hoàn tiền trên ứng dụng' }
      ]
    }
  ]);

  useEffect(() => {
    saveAdminPaymentData({ transactions, refunds });
  }, [transactions, refunds]);

  const formatVND = (num) => Number(num || 0).toLocaleString('vi-VN') + ' ₫';

  const handleSyncWithGateway = (txId) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId && tx.gatewayResponse.signatureVerified && tx.paymentStatus === 'SUCCESS'
          ? { ...tx, bookingStatus: 'CONFIRMED', anomaly: null }
          : tx
      )
    );
  };

  const handleProcessRefund = (decision) => {
    if (!decisionNote.trim()) {
      alert('Vui lòng nhập lý do phê duyệt hoặc từ chối để lưu lịch sử xử lý.');
      return;
    }
    const generatedRef = decision === 'APPROVE' ? `REF-${Math.floor(100000 + Math.random() * 900000)}` : 'N/A';
    const newStatus = decision === 'APPROVE' ? 'COMPLETED' : 'REJECTED';

    setRefunds((prev) =>
      prev.map((r) =>
        r.refundId === selectedRefund.refundId
          ? {
              ...r,
              status: newStatus,
              refCode: decision === 'APPROVE' ? generatedRef : r.refCode,
              history: [
                ...r.history,
                {
                  time: new Date().toLocaleString('vi-VN'),
                  actor: 'Quản trị viên',
                  action: `${decision === 'APPROVE' ? `Phê duyệt (Mã TC: ${generatedRef})` : 'Từ chối'} — Lý do: ${decisionNote}`
                }
              ]
            }
          : r
      )
    );
    setSelectedRefund(null);
    setDecisionNote('');
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      tx.id.toLowerCase().includes(searchTx.toLowerCase()) ||
      tx.bookingId.toLowerCase().includes(searchTx.toLowerCase()) ||
      tx.customer.toLowerCase().includes(searchTx.toLowerCase());
    const matchMethod = methodFilter === 'ALL' || tx.method === methodFilter;
    const matchStatus = statusFilter === 'ALL' || tx.paymentStatus === statusFilter;
    const matchEnv =
      envFilter === 'ALL' ||
      (envFilter === 'SANDBOX' && tx.isSandbox) ||
      (envFilter === 'PROD' && !tx.isSandbox);
    return matchSearch && matchMethod && matchStatus && matchEnv;
  });

  return (
    <div className="admin-utility-page p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Quản lý Thanh toán & Hoàn tiền</h1>
          <p className="text-xs text-slate-500 mb-0">
            Đối soát trạng thái giao dịch từ cổng thanh toán và phê duyệt yêu cầu hoàn tiền theo chính sách
          </p>
        </div>

        <div className="inline-flex bg-slate-200/70 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Giao dịch thanh toán ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'refunds'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yêu cầu hoàn tiền ({refunds.length})
          </button>
        </div>
      </div>

      {/* Chính sách kiểm soát nội bộ */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-slate-700">
        <span className="font-semibold text-blue-800">Nguyên tắc kiểm soát: </span>
        Hệ thống không cho phép đánh dấu "Đã thanh toán" thủ công để bỏ qua cổng thanh toán. Trạng thái chỉ được cập nhật khi có phản hồi xác thực chữ ký số hoặc đối soát tự động hợp lệ.
      </div>

      {activeTab === 'transactions' ? (
        <div className="space-y-4">
          {/* Thanh tìm kiếm & bộ lọc */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
            <input
              type="text"
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-80"
              placeholder="Tìm mã giao dịch, mã booking, tên khách..."
              value={searchTx}
              onChange={(e) => setSearchTx(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="ALL">Tất cả phương thức</option>
                <option value="VNPAY">VNPay</option>
                <option value="MOMO">Ví MoMo</option>
                <option value="ZALOPAY">ZaloPay</option>
                <option value="CREDIT_CARD">Thẻ Quốc tế</option>
              </select>
              <select
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="PENDING">Đang chờ xử lý</option>
                <option value="FAILED">Thất bại</option>
                <option value="EXPIRED">Đã hết hạn</option>
              </select>
              <select
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
                value={envFilter}
                onChange={(e) => setEnvFilter(e.target.value)}
              >
                <option value="ALL">Mọi môi trường</option>
                <option value="PROD">Thực tế (Production)</option>
                <option value="SANDBOX">Mô phỏng (Sandbox)</option>
              </select>
            </div>
          </div>

          {/* Bảng dữ liệu - Đã thêm whitespace-nowrap và gap-2 cho các nút */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                    <th className="py-3.5 px-4">Mã giao dịch</th>
                    <th className="py-3.5 px-4">Booking / Khách hàng</th>
                    <th className="py-3.5 px-4">Số tiền & Phương thức</th>
                    <th className="py-3.5 px-4">Thời gian</th>
                    <th className="py-3.5 px-4">TT Thanh toán</th>
                    <th className="py-3.5 px-4">TT Booking</th>
                    <th className="py-3.5 px-4">Đối chiếu</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 text-xs">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{tx.id}</div>
                        <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-medium ${tx.isSandbox ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                          {tx.isSandbox ? 'Sandbox Dev' : 'Production'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-blue-600">{tx.bookingId}</div>
                        <div className="text-slate-500 mt-0.5">{tx.customer} · {tx.service}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatVND(tx.amount)}</div>
                        <div className="text-slate-500 mt-0.5">{tx.method}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{tx.time}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.paymentStatus === 'SUCCESS' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 whitespace-nowrap">
                            Thành công
                          </span>
                        )}
                        {tx.paymentStatus === 'PENDING' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200 whitespace-nowrap">
                            Đang chờ
                          </span>
                        )}
                        {tx.paymentStatus === 'FAILED' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200 whitespace-nowrap">
                            Thất bại
                          </span>
                        )}
                        {tx.paymentStatus === 'EXPIRED' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold whitespace-nowrap">
                            Hết hạn
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.bookingStatus === 'CONFIRMED' && <span className="text-slate-700 font-medium">Đã xuất vé</span>}
                        {tx.bookingStatus === 'PENDING_PAYMENT' && <span className="text-amber-700 font-semibold">Chờ thanh toán</span>}
                        {tx.bookingStatus === 'CANCELLED' && <span className="text-rose-600 font-medium">Đã hủy</span>}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.anomaly === 'INCONSISTENT' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold whitespace-nowrap">
                            Lệch trạng thái
                          </span>
                        )}
                        {tx.anomaly === 'DUPLICATE' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold whitespace-nowrap">
                            Trùng lặp GD
                          </span>
                        )}
                        {!tx.anomaly && <span className="text-slate-500">Nhất quán</span>}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedGatewayLog(tx)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-medium transition whitespace-nowrap"
                          >
                            Phản hồi cổng
                          </button>
                          {tx.anomaly === 'INCONSISTENT' && (
                            <button
                              onClick={() => handleSyncWithGateway(tx.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition whitespace-nowrap shadow-2xs"
                            >
                              Đồng bộ đối soát
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {refunds.map((rf) => (
            <div key={rf.refundId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                    {rf.refundId}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">Booking: {rf.bookingId}</span>
                  <span className="text-xs text-slate-500">· Giao dịch: {rf.txId} · Khách: {rf.customer}</span>
                </div>
                <div>
                  {rf.status === 'PENDING_APPROVAL' && <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">Chờ phê duyệt</span>}
                  {rf.status === 'PROCESSING' && <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">Đang xử lý hoàn</span>}
                  {rf.status === 'COMPLETED' && <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">Đã hoàn tiền</span>}
                  {rf.status === 'REJECTED' && <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">Đã từ chối</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-slate-500">Tiền đã thu: <b className="text-slate-800">{formatVND(rf.paidAmount)}</b></div>
                  <div className="text-slate-500">Đề xuất hoàn: <b className="text-rose-600">{formatVND(rf.refundAmount)}</b></div>
                  <div className="text-slate-500">Mã tham chiếu: <b className="text-slate-800">{rf.refCode}</b></div>
                </div>
                <div className="md:col-span-2 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div><span className="font-semibold text-slate-700">Lý do yêu cầu:</span> {rf.reason}</div>
                  <div><span className="font-semibold text-slate-700">Kiểm tra chính sách:</span> {rf.policyCheck}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-500">
                  <b className="text-slate-700">Lịch sử xử lý: </b>
                  {rf.history.map((h, i) => (
                    <span key={i} className="mr-3">[{h.time}] {h.actor}: {h.action}</span>
                  ))}
                </div>
                {rf.status === 'PENDING_APPROVAL' && (
                  <button
                    onClick={() => { setSelectedRefund(rf); setDecisionNote(''); }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Xét duyệt yêu cầu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Xem phản hồi cổng thanh toán */}
      {selectedGatewayLog && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 mb-0">Phản hồi từ cổng thanh toán ({selectedGatewayLog.method})</h3>
              <button onClick={() => setSelectedGatewayLog(null)} className="text-xs text-slate-400 hover:text-slate-700">Đóng</button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs overflow-x-auto mb-0">
              {JSON.stringify(selectedGatewayLog.gatewayResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Modal Phê duyệt hoàn tiền */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 mb-0">Xét duyệt yêu cầu {selectedRefund.refundId}</h3>
              <button onClick={() => setSelectedRefund(null)} className="text-xs text-slate-400 hover:text-slate-700">Đóng</button>
            </div>
            <div className="text-xs space-y-2">
              <div>Khách hàng: <b>{selectedRefund.customer}</b> · Số tiền hoàn: <b className="text-rose-600">{formatVND(selectedRefund.refundAmount)}</b></div>
              <label className="block font-semibold text-slate-700 pt-1">Lý do phê duyệt hoặc từ chối *</label>
              <textarea
                rows="3"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-blue-500"
                placeholder="Nhập lý do chi tiết để lưu lịch sử..."
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => handleProcessRefund('REJECT')} className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50">
                Từ chối
              </button>
              <button onClick={() => handleProcessRefund('APPROVE')} className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">
                Phê duyệt hoàn tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}