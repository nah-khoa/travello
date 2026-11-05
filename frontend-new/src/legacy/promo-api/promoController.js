const PromoCode = require('./PromoCode');

// 1. Lấy danh sách tất cả mã khuyến mãi (Có lọc theo từ khóa, trạng thái, dịch vụ)
exports.getAllPromos = async (req, res) => {
  try {
    const { search, status, service } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (service && service !== 'ALL') {
      query.applicableService = service;
    }

    const promos = await PromoCode.find(query).sort({ createdAt: -1 });
    
    // Lọc thêm theo trạng thái thực tế (Đang hoạt động / Tắt / Hết hạn)
    const now = new Date();
    const filteredPromos = promos.filter(p => {
      const isExpired = now > new Date(p.endDate) || p.usedCount >= p.usageLimit;
      if (status === 'ACTIVE') return p.isActive && !isExpired;
      if (status === 'INACTIVE') return !p.isActive;
      if (status === 'EXPIRED') return isExpired;
      return true;
    });

    res.status(200).json({ success: true, data: filteredPromos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Tạo mới mã giảm giá
exports.createPromo = async (req, res) => {
  try {
    const existing = await PromoCode.findOne({ code: req.body.code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá này đã tồn tại!' });
    }
    const promo = new PromoCode(req.body);
    await promo.save();
    res.status(201).json({ success: true, message: 'Tạo mã thành công!', data: promo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. Chỉnh sửa nội dung và điều kiện mã giảm giá
exports.updatePromo = async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!promo) return res.status(404).json({ success: false, message: 'Không tìm thấy mã!' });
    res.status(200).json({ success: true, message: 'Cập nhật thành công!', data: promo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 4. Bật / Tắt nhanh trạng thái mã giảm giá
exports.toggleStatus = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Không tìm thấy mã!' });
    
    promo.isActive = !promo.isActive;
    await promo.save();
    res.status(200).json({ 
      success: true, 
      message: `Đã ${promo.isActive ? 'bật' : 'tắt'} mã ${promo.code}`, 
      data: promo 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Xóa mã giảm giá
exports.deletePromo = async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Đã xóa mã giảm giá!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. KIỂM TRA & ÁP DỤNG MÃ GIẢM GIÁ (Ngăn mã không hợp lệ hoặc quá giới hạn)
exports.validateAndApplyPromo = async (req, res) => {
  try {
    const { code, userId, serviceType, orderValue, confirmApply = false } = req.body;
    const now = new Date();

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });

    // Kiểm tra tồn tại
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại!' });
    }

    // Kiểm tra trạng thái Bật/Tắt
    if (!promo.isActive) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá hiện đang tạm khóa!' });
    }

    // Kiểm tra thời gian bắt đầu & kết thúc
    if (now < new Date(promo.startDate)) {
      return res.status(400).json({ success: false, message: 'Chương trình khuyến mãi chưa bắt đầu!' });
    }
    if (now > new Date(promo.endDate)) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn!' });
    }

    // Kiểm tra tổng số lượt sử dụng toàn hệ thống
    if (promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng!' });
    }

    // Kiểm tra dịch vụ áp dụng (Toàn hệ thống hoặc riêng Máy bay, Xe khách, Tàu hỏa)
    if (promo.applicableService !== 'ALL' && promo.applicableService !== serviceType) {
      const serviceNames = { FLIGHT: 'Máy bay', BUS: 'Xe khách', TRAIN: 'Tàu hỏa' };
      return res.status(400).json({ 
        success: false, 
        message: `Mã này chỉ áp dụng cho dịch vụ ${serviceNames[promo.applicableService]}!` 
      });
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderValue < promo.minOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Đơn hàng tối thiểu phải từ ${promo.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này!` 
      });
    }

    // Kiểm tra giới hạn số lượt mỗi khách hàng
    if (userId) {
      const userRecord = promo.usageByUsers.find(u => u.userId === userId);
      if (userRecord && userRecord.count >= promo.perUserLimit) {
        return res.status(400).json({ 
          success: false, 
          message: `Bạn đã dùng tối đa (${promo.perUserLimit} lần) cho mã giảm giá này!` 
        });
      }
    }

    // Tính toán số tiền được giảm thực tế
    let discountAmount = 0;
    if (promo.discountType === 'FIXED') {
      discountAmount = promo.discountValue;
    } else if (promo.discountType === 'PERCENT') {
      discountAmount = (orderValue * promo.discountValue) / 100;
      if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
        discountAmount = promo.maxDiscountAmount;
      }
    }

    // Đảm bảo tiền giảm không vượt quá giá trị đơn hàng
    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }

    const finalPrice = orderValue - discountAmount;

    // Nếu confirmApply = true (Khách bấm đặt vé/thanh toán), tiến hành trừ lượt và cộng thống kê
    if (confirmApply) {
      promo.usedCount += 1;
      promo.totalDiscountGiven += discountAmount;

      if (userId) {
        const userIndex = promo.usageByUsers.findIndex(u => u.userId === userId);
        if (userIndex > -1) {
          promo.usageByUsers[userIndex].count += 1;
        } else {
          promo.usageByUsers.push({ userId, count: 1 });
        }
      }
      await promo.save();
    }

    res.status(200).json({
      success: true,
      message: confirmApply ? 'Áp dụng mã thành công và đã ghi nhận lượt dùng!' : 'Mã hợp lệ!',
      data: {
        code: promo.code,
        orderValue,
        discountAmount,
        finalPrice
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Hàm nạp dữ liệu mẫu AN TOÀN (Không bao giờ xóa mã bạn đã tự thêm)
exports.seedSamplePromos = async (req, res) => {
  try {
    const sampleData = [
      {
        code: 'TRAVELWINTER',
        title: 'Khuyến mãi mùa đông',
        description: 'Áp dụng cho đơn hàng từ 2.000.000 VNĐ',
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80',
        discountType: 'PERCENT',
        discountValue: 15,
        maxDiscountAmount: 300000,
        minOrderValue: 2000000,
        applicableService: 'ALL',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 500,
        perUserLimit: 2,
        usedCount: 150,
        totalDiscountGiven: 22500000,
        isActive: true
      },
      {
        code: 'FIRSTFLIGHT',
        title: 'Ưu đãi chuyến bay đầu tiên',
        description: 'Chỉ dành cho khách hàng mới',
        imageUrl: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&auto=format&fit=crop&q=80',
        discountType: 'FIXED',
        discountValue: 100000,
        maxDiscountAmount: null,
        minOrderValue: 500000,
        applicableService: 'FLIGHT',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 500,
        perUserLimit: 1,
        usedCount: 50,
        totalDiscountGiven: 5000000,
        isActive: false
      },
      {
        code: 'HOTELSTAY',
        title: 'Ưu đãi nghỉ dưỡng & di chuyển',
        description: 'Đặt phòng khách sạn từ 2 đêm trở lên',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
        discountType: 'PERCENT',
        discountValue: 20,
        maxDiscountAmount: 500000,
        minOrderValue: 1500000,
        applicableService: 'ALL',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 500,
        perUserLimit: 2,
        usedCount: 150,
        totalDiscountGiven: 30000000,
        isActive: true
      },
      {
        code: 'TMWELCOME75',
        title: 'Chào bạn mới Travel Mini',
        description: 'Áp dụng toàn hệ thống cho đơn từ 300.000 VNĐ',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
        discountType: 'FIXED',
        discountValue: 75000,
        maxDiscountAmount: null,
        minOrderValue: 300000,
        applicableService: 'BUS',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 500,
        perUserLimit: 1,
        usedCount: 150,
        totalDiscountGiven: 11250000,
        isActive: true
      },
      {
        code: 'TMFLIGHT10',
        title: 'Giảm 10% vé máy bay',
        description: 'Đặt vé máy bay khứ hồi hoặc từ 2 người trở lên',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        discountType: 'PERCENT',
        discountValue: 10,
        maxDiscountAmount: 200000,
        minOrderValue: 1000000,
        applicableService: 'FLIGHT',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 500,
        perUserLimit: 2,
        usedCount: 150,
        totalDiscountGiven: 15000000,
        isActive: true
      },
      {
        code: 'TMTRAIN50',
        title: 'Giảm 50K vé tàu hỏa',
        description: 'Áp dụng cho tuyến tàu hỏa từ 400.000 VNĐ trở lên',
        imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80',
        discountType: 'FIXED',
        discountValue: 50000,
        maxDiscountAmount: null,
        minOrderValue: 400000,
        applicableService: 'TRAIN',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 500,
        perUserLimit: 2,
        usedCount: 150,
        totalDiscountGiven: 7500000,
        isActive: true
      }
    ];

    // Chỉ thêm nếu mã đó chưa tồn tại trong MongoDB, giữ nguyên các mã bạn đã tự thêm
    for (const item of sampleData) {
      await PromoCode.updateOne(
        { code: item.code },
        { $setOnInsert: item },
        { upsert: true }
      );
    }

    res.status(200).json({ success: true, message: 'Đã bổ sung các mã mẫu còn thiếu (giữ nguyên dữ liệu cũ)!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};