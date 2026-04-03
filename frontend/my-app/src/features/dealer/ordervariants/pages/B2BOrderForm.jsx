import React, { useState, useEffect, useMemo } from "react";
import { FiPlus, FiTrash2, FiShoppingCart, FiPackage, FiInfo, FiLayers, FiCheckCircle, FiLoader, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllVariantsPaginated } from "../../../evm/catalog/services/vehicleCatalogService";
import { createB2BOrder } from "../services/dealerSalesService";
import { useAuthContext } from "../../../auth/AuthProvider";
import Swal from "sweetalert2";

const B2BOrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profileId: dealerId } = useAuthContext();

  const [allVariants, setAllVariants] = useState([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState(1);

  // Xử lý dữ liệu truyền từ Inventory hoặc Catalog
  useEffect(() => {
    if (location.state?.reorderItem) {
      const item = location.state.reorderItem;
      setSelectedVariantId(item.variantId.toString());
      setCurrentQuantity(item.reorderLevel || 1);
    } else if (location.state?.reorderOrder) {
      const order = location.state.reorderOrder;
      const items = order.orderItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        name: `Sản phẩm #${item.variantId}`, // Tạm thời, sẽ được update khi variants loaded
        sku: "N/A"
      }));
      setOrderItems(items);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchVariants = async () => {
      setIsLoadingVariants(true);
      try {
        const params = {
          page: 0,
          size: 500,
          sort: ["vehicleModel.modelName,asc", "versionName,asc"],
        };
        const response = await getAllVariantsPaginated(params);
        const variants = response.data.data.content || [];
        setAllVariants(variants);

        // Cập nhật tên/sku cho items từ reorderOrder
        if (location.state?.reorderOrder) {
          setOrderItems(prev => prev.map(item => {
            const matched = variants.find(v => v.variantId === item.variantId);
            return matched ? {
              ...item,
              name: `${matched.modelName} - ${matched.versionName} (${matched.color})`,
              sku: matched.skuCode
            } : item;
          }));
        }
      } catch (err) {
        console.error("Failed to fetch variants:", err);
        setError("Không thể nạp danh mục sản phẩm.");
      } finally {
        setIsLoadingVariants(false);
      }
    };
    fetchVariants();
  }, [location.state]);

  const handleAddItem = () => {
    if (!selectedVariantId || currentQuantity <= 0) {
      setError("Vui lòng lựa chọn xe và số lượng hợp lệ.");
      return;
    }

    const variantId = Number(selectedVariantId);
    const quantity = Number(currentQuantity);
    const existingItemIdx = orderItems.findIndex(item => item.variantId === variantId);

    if (existingItemIdx > -1) {
      const newItems = [...orderItems];
      newItems[existingItemIdx].quantity += quantity;
      setOrderItems(newItems);
    } else {
      const v = allVariants.find(v => v.variantId === variantId);
      setOrderItems([
        ...orderItems,
        {
          variantId,
          quantity,
          name: `${v.modelName} - ${v.versionName} (${v.color})`,
          sku: v.skuCode,
        },
      ]);
    }

    setSelectedVariantId("");
    setCurrentQuantity(1);
    setError(null);
  };

  const handleRemoveItem = (variantId) => {
    setOrderItems(orderItems.filter((item) => item.variantId !== variantId));
  };

  const handleSubmitOrder = async () => {
    const result = await Swal.fire({
      title: "Gửi Đơn Đặt Hàng?",
      text: `Hệ thống sẽ gửi yêu cầu đặt ${orderItems.length} sản phẩm tới Hãng.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xác nhận gửi",
      cancelButtonText: "Xem lại giỏ hàng",
      background: '#fff',
      customClass: {
        title: 'text-2xl font-bold text-slate-900',
        popup: 'rounded-[32px] shadow-2xl border-none'
      }
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createB2BOrder({
        items: orderItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      await Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Đơn hàng của bạn đã được gửi tới VoltNexus. Vui lòng chờ phản hồi từ Hãng.",
        confirmButtonColor: "#10b981",
        customClass: { popup: 'rounded-3xl' }
      });

      setOrderItems([]);
      navigate("../orders");
    } catch (err) {
      setError(err.response?.data?.message || "Gửi đơn hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính toán tóm tắt giỏ hàng
  const totalQuantity = useMemo(() => orderItems.reduce((sum, item) => sum + item.quantity, 0), [orderItems]);

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-all hover:shadow-md"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Tạo Đơn Đặt Hàng B2B
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Section 1: Product Selection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

              <div className="relative z-10">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                    <FiPackage size={20} />
                  </div>
                  Lựa chọn Sản phẩm
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tìm chọn phiên bản xe</label>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      disabled={isLoadingVariants}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="">
                        {isLoadingVariants ? "Đang truy vấn danh mục..." : "-- Chọn một phiên bản xe --"}
                      </option>
                      {allVariants.map((v) => (
                        <option key={v.variantId} value={v.variantId}>
                          {v.modelName} - {v.versionName} ({v.color}) - [{v.skuCode}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Số lượng đặt</label>
                      <input
                        type="number"
                        min="1"
                        value={currentQuantity}
                        onChange={(e) => setCurrentQuantity(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddItem}
                        disabled={!selectedVariantId || isLoadingVariants}
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400"
                      >
                        <FiPlus size={20} /> Thêm vào Giỏ
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-xs animate-in slide-in-from-top-4">
                    <FiInfo /> {error}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100/50 flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
                <FiInfo size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-indigo-900 mb-1">Quy định đặt hàng</h4>
                <p className="text-xs text-indigo-700/70 font-medium leading-relaxed italic">
                  Đơn đặt hàng B2B sau khi được gửi lên Hãng sẽ trải qua quy trình xét duyệt tồn kho trung tâm. Quý đại lý có thể chủ động hủy đơn nếu trạng thái vẫn ở mức "Chờ duyệt".
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Order Summary / Cart */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 sticky top-8">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiShoppingCart className="text-indigo-600" />
                  <span>Giỏ hàng Tạm</span>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">{orderItems.length} mục</span>
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {orderItems.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                    <FiLayers size={48} />
                    <p className="text-sm font-black uppercase tracking-widest">Trống trải...</p>
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <div
                      key={item.variantId}
                      className="group flex justify-between items-center p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-3xl transition-all duration-300"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">{item.sku}</span>
                          <span className="text-xs font-black text-indigo-600">x {item.quantity} chi tiết</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.variantId)}
                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-white rounded-2xl transition-all active:scale-75 shadow-sm shadow-transparent hover:shadow-rose-100"
                        title="Xóa khỏi đơn"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Tổng số lượng</span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">{totalQuantity} <span className="text-sm text-slate-400 font-bold ml-1">Xe</span></span>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || orderItems.length === 0}
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-[28px] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin text-white/50" />
                      <span>Đang xử lý đơn...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={20} className="text-emerald-400" />
                      <span>Gửi Đơn Lên Hãng Ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default B2BOrderForm;
