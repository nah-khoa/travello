import { useState } from 'react';
import './admin-utility-pages.css';

export default function CustomerSupportManagement() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [bookingLookup, setBookingLookup] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newInternalNote, setNewInternalNote] = useState('');
  const [newCustomerReply, setNewCustomerReply] = useState('');

  const [tickets, setTickets] = useState([
    {
      ticketId: 'SUP-101',
      bookingId: 'BK-BS1044',
      customerEmail: 'bichtran@gmail.com',
      customerName: 'Trần Thị Bích',
      category: 'Thanh toán',
      subject: 'Đã thanh toán qua ví MoMo nhưng trạng thái vé chưa cập nhật',
      assignedTo: 'Chưa phân công',
      status: 'NEW',
      internalNotes: ['Cần kiểm tra đối soát giao dịch TXN-99202.'],
      replyHistory: []
    },
    {
      ticketId: 'SUP-102',
      bookingId: 'BK-FL8821',
      customerEmail: 'annguyen@gmail.com',
      customerName: 'Nguyễn Văn An',
      category: 'Đổi vé / Hành trình',
      subject: 'Yêu cầu đổi giờ khởi hành chặng TP.HCM - Hà Nội sang chuyến 16:00',
      assignedTo: 'Minh Khoa',
      status: 'IN_PROGRESS',
      internalNotes: ['Chuyến 16:00 của Vietnam Airlines còn trống 4 chỗ.'],
      replyHistory: ['03/11/2026 09:00 - Đã gửi thông báo mức phí chênh lệch qua email.']
    },
    {
      ticketId: 'SUP-103',
      bookingId: 'BK-TR4410',
      customerEmail: 'hado@gmail.com',
      customerName: 'Đỗ Thu Hà',
      category: 'Hủy vé & Hoàn tiền',
      subject: 'Tra cứu tiến độ hoàn tiền vé tàu SE2',
      assignedTo: 'Lan Anh',
      status: 'RESOLVED',
      internalNotes: ['Đã cung cấp mã tham chiếu hoàn tiền VNP-RF-882910.'],
      replyHistory: ['02/11/2026 16:30 - Đã gửi xác nhận hoàn tiền qua email khách hàng.']
    }
  ]);

  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 'TPL-CONFIRM',
      name: 'Mẫu Email Xác nhận đặt vé thành công',
      subject: '[Travel Mini] Xác nhận đặt chỗ thành công - Mã {{booking_id}}',
      body: 'Xin chào {{customer_name}},\nĐơn đặt vé {{booking_id}} của bạn đã được xác nhận. Mã vé điện tử: {{pnr_code}}. Giờ khởi hành: {{departure_time}}.'
    },
    {
      id: 'TPL-REMIND',
      name: 'Mẫu Email Nhắc thanh toán đơn giữ chỗ',
      subject: '[Travel Mini] Nhắc hoàn tất thanh toán mã đặt chỗ {{booking_id}}',
      body: 'Xin chào {{customer_name}},\nĐơn đặt chỗ {{booking_id}} trị giá {{amount}} sẽ hết hạn giữ chỗ vào lúc {{expire_time}}. Vui lòng thanh toán để xuất vé.'
    },
    {
      id: 'TPL-SCHEDULE',
      name: 'Mẫu Email Thông báo thay đổi lịch trình chuyến đi',
      subject: '[Travel Mini] Thông báo điều chỉnh giờ khởi hành chuyến {{trip_code}}',
      body: 'Xin chào {{customer_name}},\nĐơn vị vận tải {{partner_name}} thông báo thay đổi giờ khởi hành của mã đặt chỗ {{booking_id}} từ {{old_time}} sang {{new_time}}.'
    }
  ]);

  const handleAssignStaff = (ticketId, staffName) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId
          ? { ...t, assignedTo: staffName, status: t.status === 'NEW' ? 'IN_PROGRESS' : t.status }
          : t
      )
    );
  };

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets((prev) => prev.map((t) => (t.ticketId === ticketId ? { ...t, status: newStatus } : t)));
  };

  const handleAddNoteAndReply = () => {
    if (!selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.ticketId === selectedTicket.ticketId) {
          const updated = {
            ...t,
            internalNotes: newInternalNote.trim()
              ? [...t.internalNotes, `${new Date().toLocaleTimeString('vi-VN')} - ${newInternalNote}`]
              : t.internalNotes,
            replyHistory: newCustomerReply.trim()
              ? [...t.replyHistory, `${new Date().toLocaleTimeString('vi-VN')} - Phản hồi: "${newCustomerReply}"`]
              : t.replyHistory
          };
          setSelectedTicket(updated);
          return updated;
        }
        return t;
      })
    );
    setNewInternalNote('');
    setNewCustomerReply('');
  };

  const filteredTickets = tickets.filter((t) => {
    const matchLookup =
      t.bookingId.toLowerCase().includes(bookingLookup.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(bookingLookup.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(bookingLookup.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchLookup && matchStatus;
  });

  return (
    <div className="admin-utility-page p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Quản lý Thông báo & Hỗ trợ Khách hàng</h1>
          <p className="text-xs text-slate-500 mb-0">
            Tiếp nhận yêu cầu hỗ trợ, tra cứu đặt chỗ, phân công nhân sự và cấu hình mẫu email tự động
          </p>
        </div>

        <div className="inline-flex bg-slate-200/70 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'tickets'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phiếu yêu cầu hỗ trợ ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'templates'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mẫu Email tự động ({emailTemplates.length})
          </button>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
            <input
              type="text"
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-96"
              placeholder="Tra cứu Booking theo Mã (BK-...) hoặc Email khách hàng..."
              value={bookingLookup}
              onChange={(e) => setBookingLookup(e.target.value)}
            />
            <select
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NEW">Mới tiếp nhận</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="py-3 px-4">Mã phiếu</th>
                  <th className="py-3 px-4">Booking / Khách hàng</th>
                  <th className="py-3 px-4">Vấn đề ghi nhận</th>
                  <th className="py-3 px-4">Nhân viên xử lý</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {filteredTickets.map((t) => (
                  <tr key={t.ticketId} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.ticketId}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-blue-600">{t.bookingId}</div>
                      <div className="text-slate-500">{t.customerName} ({t.customerEmail})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium mb-1">
                        {t.category}
                      </span>
                      <div className="font-medium text-slate-800">{t.subject}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        value={t.assignedTo}
                        onChange={(e) => handleAssignStaff(t.ticketId, e.target.value)}
                      >
                        <option value="Chưa phân công">Chưa phân công</option>
                        <option value="Minh Khoa">Minh Khoa</option>
                        <option value="Lan Anh">Lan Anh</option>
                        <option value="Hoàng Nam">Hoàng Nam</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.ticketId, e.target.value)}
                      >
                        <option value="NEW">Mới</option>
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="RESOLVED">Đã giải quyết</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition"
                      >
                        Ghi chú & Phản hồi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {emailTemplates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
              <div className="font-bold text-slate-900 text-sm">{tpl.name}</div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tiêu đề Email</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 p-2 font-medium"
                  value={tpl.subject}
                  onChange={(e) =>
                    setEmailTemplates((prev) => prev.map((item) => (item.id === tpl.id ? { ...item, subject: e.target.value } : item)))
                  }
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nội dung mẫu</label>
                <textarea
                  rows="3"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-600"
                  value={tpl.body}
                  onChange={(e) =>
                    setEmailTemplates((prev) => prev.map((item) => (item.id === tpl.id ? { ...item, body: e.target.value } : item)))
                  }
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => alert('Đã lưu mẫu email thành công.')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Lưu mẫu Email
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 mb-0">
                Hồ sơ xử lý {selectedTicket.ticketId} · Booking {selectedTicket.bookingId}
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-700">Đóng</button>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-semibold text-slate-800">Ghi chú nội bộ:</div>
              <ul className="list-disc pl-4 text-slate-600 mb-2">
                {selectedTicket.internalNotes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
              <div className="font-semibold text-slate-800">Lịch sử phản hồi khách hàng:</div>
              <ul className="list-disc pl-4 text-slate-600 mb-0">
                {selectedTicket.replyHistory.length === 0 ? (
                  <li className="text-slate-400">Chưa có phản hồi</li>
                ) : (
                  selectedTicket.replyHistory.map((r, i) => <li key={i}>{r}</li>)
                )}
              </ul>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thêm ghi chú nội bộ</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 p-2"
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gửi phản hồi tới khách ({selectedTicket.customerEmail})</label>
              <textarea
                rows="2"
                className="w-full rounded-lg border border-slate-200 p-2"
                value={newCustomerReply}
                onChange={(e) => setNewCustomerReply(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedTicket(null)} className="px-3.5 py-1.5 rounded-lg border border-slate-200 font-medium">
                Đóng
              </button>
              <button onClick={handleAddNoteAndReply} className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                Cập nhật & Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}