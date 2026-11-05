const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  title: { type: String, required: true }, // Tên chương trình (VD: Giảm giá vé máy bay)
  description: { type: String, required: true }, // Mô tả điều kiện hiển thị trên thẻ
  imageUrl: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60' 
  },
  
  // Loại giảm giá: 'PERCENT' (%) hoặc 'FIXED' (Số tiền cố định)
  discountType: { 
    type: String, 
    enum: ['PERCENT', 'FIXED'], 
    required: true 
  },
  discountValue: { type: Number, required: true, min: 0 }, // Giá trị giảm (VD: 15% hoặc 75000đ)
  maxDiscountAmount: { type: Number, default: null }, // Mức giảm tối đa (áp dụng cho PERCENT, null = không giới hạn)
  minOrderValue: { type: Number, default: 0 }, // Giá trị đơn hàng tối thiểu
  
  // Dịch vụ áp dụng: Toàn hệ thống, Máy bay, Xe khách, Tàu hỏa
  applicableService: { 
    type: String, 
    enum: ['ALL', 'FLIGHT', 'BUS', 'TRAIN'], 
    default: 'ALL' 
  },
  
  // Thời gian hiệu lực
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Giới hạn sử dụng
  usageLimit: { type: Number, required: true, min: 1 }, // Tổng số lượt tối đa toàn hệ thống
  perUserLimit: { type: Number, default: 1, min: 1 }, // Số lượt tối đa cho mỗi khách hàng
  
  // Thống kê thực tế
  usedCount: { type: Number, default: 0 }, // Số lần đã sử dụng
  totalDiscountGiven: { type: Number, default: 0 }, // Tổng số tiền đã giảm cho khách (VNĐ)
  
  // Trạng thái bật/tắt chủ động từ Admin
  isActive: { type: Boolean, default: true },
  
  // Lưu vết số lần sử dụng của từng user để chặn vượt giới hạn mỗi khách
  usageByUsers: [{
    userId: { type: String, required: true },
    count: { type: Number, default: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);