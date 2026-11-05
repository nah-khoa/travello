import { useEffect, useMemo, useState } from 'react';
import './admin-utility-pages.css';
import {
  loadAdminPaymentData,
  loadTransportTrips,
} from '../../../shared/services/adminTransportData';

export default function SystemReports() {
  const [period, setPeriod] = useState('THIS_MONTH');
  const [transportTrips, setTransportTrips] = useState(loadTransportTrips);
  const [paymentData, setPaymentData] = useState(() =>
    loadAdminPaymentData({ transactions: [], refunds: [] }),
  );

  useEffect(() => {
    const refresh = () => {
      setTransportTrips(loadTransportTrips());
      setPaymentData(loadAdminPaymentData({ transactions: [], refunds: [] }));
    };
    window.addEventListener('admin-transport-data-updated', refresh);
    window.addEventListener('admin-payment-data-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('admin-transport-data-updated', refresh);
      window.removeEventListener('admin-payment-data-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const vehicleComparison = useMemo(() => {
    const labels = {
      flight: 'Máy bay (Flight)',
      bus: 'Xe khách (Bus)',
      train: 'Tàu hỏa (Train)',
    };
    return Object.entries(transportTrips).map(([service, trips]) => {
      const serviceTransactions = paymentData.transactions.filter((tx) =>
        (service === 'flight' && tx.service === 'Máy bay') ||
        (service === 'bus' && tx.service === 'Xe khách') ||
        (service === 'train' && tx.service === 'Tàu hỏa'),
      );
      const paid = serviceTransactions.filter((tx) => tx.paymentStatus === 'SUCCESS');
      const pending = serviceTransactions.filter((tx) => tx.paymentStatus === 'PENDING');
      const cancelled = serviceTransactions.filter((tx) => tx.paymentStatus === 'FAILED');
      const collectedRevenue = paid.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      const refunded = paymentData.refunds
        .filter((refund) => {
          const transaction = serviceTransactions.find((tx) => tx.bookingId === refund.bookingId);
          return transaction && refund.status === 'COMPLETED';
        })
        .reduce((sum, refund) => sum + Number(refund.refundAmount || 0), 0);
      const seats = trips.reduce((sum, trip) => sum + Number(trip.seats || 0), 0);
      return {
        service: labels[service],
        totalBookings: trips.length,
        paidTickets: paid.length,
        pendingTickets: pending.length,
        cancelledTickets: cancelled.length,
        seatsSold: paid.length,
        seatsAvailable: Math.max(0, seats - paid.length),
        collectedRevenue,
        refunded,
        netRevenue: collectedRevenue - refunded,
      };
    });
  }, [paymentData, transportTrips]);

  const financialSummary = useMemo(() => {
    const grossBookingValue = paymentData.transactions
      .filter((tx) => tx.paymentStatus === 'SUCCESS' || tx.paymentStatus === 'PENDING')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const collectedAmount = paymentData.transactions
      .filter((tx) => tx.paymentStatus === 'SUCCESS')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const refundedAmount = vehicleComparison.reduce((sum, item) => sum + item.refunded, 0);
    return {
      grossBookingValue,
      unpaidPendingValue: paymentData.transactions
        .filter((tx) => tx.paymentStatus === 'PENDING')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
      collectedAmount,
      refundedAmount,
      netActualRevenue: collectedAmount - refundedAmount,
    };
  }, [paymentData, vehicleComparison]);

  const formatVND = (num) => Number(num || 0).toLocaleString('vi-VN') + ' ₫';

  const handleExportCSV = () => {
    const headers = [
      'Phương tiện,Tổng Booking,Vé đã thanh toán,Vé chờ xử lý,Vé đã hủy,Chỗ đã bán,Chỗ còn trống,Tiền đã thu,Tiền hoàn lại,Doanh thu thực tế'
    ];
    const rows = vehicleComparison.map(
      (v) =>
        `"${v.service}",${v.totalBookings},${v.paidTickets},${v.pendingTickets},${v.cancelledTickets},${v.seatsSold},${v.seatsAvailable},${v.collectedRevenue},${v.refunded},${v.netRevenue}`
    );
    const csvContent = '\uFEFF' + headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_TravelMini_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-utility-page p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Báo cáo & Thống kê Hệ thống</h1>
          <p className="text-xs text-slate-500 mb-0">
            Phân tách minh bạch tổng tiền đặt chỗ, tiền đã thu, tiền hoàn lại và doanh thu thực tế
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <select
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="TODAY">Hôm nay (03/11/2026)</option>
            <option value="THIS_MONTH">Tháng 11 / 2026</option>
            <option value="Q4_2026">Quý 4 / 2026</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
          >
            Xuất báo cáo CSV / Excel
          </button>
        </div>
      </div>

      {/* 4 Chỉ số tài chính phân tách rõ ràng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">1. Tổng tiền Booking (Gross)</div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatVND(financialSummary.grossBookingValue)}</div>
          <div className="text-[11px] text-amber-600 mt-1">
            Gồm {formatVND(financialSummary.unpaidPendingValue)} chưa thanh toán
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">2. Tiền đã thu (Giao dịch thành công)</div>
          <div className="text-lg font-bold text-blue-600 mt-1">{formatVND(financialSummary.collectedAmount)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Không tính đơn chờ thanh toán</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">3. Tiền hoàn lại (Refunded)</div>
          <div className="text-lg font-bold text-rose-600 mt-1">-{formatVND(financialSummary.refundedAmount)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Đã hoàn trả qua cổng thanh toán</div>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="text-xs text-emerald-800 font-semibold">4. Doanh thu thực tế (Net Revenue)</div>
          <div className="text-lg font-bold text-emerald-700 mt-1">{formatVND(financialSummary.netActualRevenue)}</div>
          <div className="text-[11px] text-emerald-600 mt-1">= Tiền đã thu - Tiền hoàn lại</div>
        </div>
      </div>

      {/* Thống kê tổng quan 3 cột */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="font-bold text-slate-800">Khách hàng & Tài khoản</div>
          <div className="flex justify-between text-slate-600"><span>Tổng số khách hàng:</span><b className="text-slate-900">2,635</b></div>
          <div className="flex justify-between text-slate-600"><span>Tài khoản đang hoạt động:</span><b className="text-emerald-600">2,490 (94.5%)</b></div>
          <div className="flex justify-between text-slate-600"><span>Khách hàng mới trong kỳ:</span><b className="text-blue-600">+312</b></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="font-bold text-slate-800">Trạng thái Vé (1,482 Booking)</div>
          <div className="flex justify-between text-slate-600"><span>Vé đã thanh toán:</span><b className="text-emerald-600">1,340 vé</b></div>
          <div className="flex justify-between text-slate-600"><span>Vé đang chờ xử lý:</span><b className="text-amber-600">79 vé</b></div>
          <div className="flex justify-between text-slate-600"><span>Vé đã hủy:</span><b className="text-rose-600">63 vé</b></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="font-bold text-slate-800">Thống kê Mã giảm giá</div>
          <div className="flex justify-between text-slate-600"><span>Tổng lượt sử dụng:</span><b className="text-blue-600">800 lượt</b></div>
          <div className="flex justify-between text-slate-600"><span>Mã dùng nhiều nhất:</span><b className="text-slate-900">TRAVELWINTER</b></div>
          <div className="flex justify-between text-slate-600"><span>Tổng giá trị ưu đãi:</span><b className="text-rose-600">91.250.000 ₫</b></div>
        </div>
      </div>

      {/* Bảng so sánh phương tiện */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-0">
            So sánh hiệu quả khai thác Máy bay, Xe khách, Tàu hỏa & Thống kê chỗ
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Phương tiện</th>
                <th className="py-3 px-4 text-center">Tổng Booking</th>
                <th className="py-3 px-4 text-center">Đã TT / Chờ / Hủy</th>
                <th className="py-3 px-4">Số lượng chỗ Đã bán / Còn trống</th>
                <th className="py-3 px-4 text-right">Tiền đã thu</th>
                <th className="py-3 px-4 text-right">Tiền hoàn lại</th>
                <th className="py-3 px-4 text-right">Doanh thu thực tế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {vehicleComparison.map((v, i) => {
                const totalSeats = v.seatsSold + v.seatsAvailable;
                const soldPercent = Math.round((v.seatsSold / totalSeats) * 100);
                return (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{v.service}</td>
                    <td className="py-3.5 px-4 text-center font-semibold">{v.totalBookings}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-emerald-600 font-semibold">{v.paidTickets}</span> /{' '}
                      <span className="text-amber-600 font-semibold">{v.pendingTickets}</span> /{' '}
                      <span className="text-rose-600 font-semibold">{v.cancelledTickets}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Đã bán: <b>{v.seatsSold}</b> ({soldPercent}%)</span>
                        <span className="text-slate-400">Trống: <b>{v.seatsAvailable}</b></span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${soldPercent}%` }} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">{formatVND(v.collectedRevenue)}</td>
                    <td className="py-3.5 px-4 text-right text-rose-600">-{formatVND(v.refunded)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{formatVND(v.netRevenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}