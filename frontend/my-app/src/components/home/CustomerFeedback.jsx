import { Star, Quote } from "lucide-react";

// Dữ liệu giả lập nhiều lên để chạy slider
const initialFeedbacks = [
  { id: 1, name: "Nguyễn Văn A", rating: 5, comment: "Dịch vụ tuyệt vời, nhân viên nhiệt tình. Xe EVM X5 vận hành quá êm.", vehicle: "EVM X5 Premium" },
  { id: 2, name: "Trần Thị B", rating: 4, comment: "Thiết kế xe đẹp, nội thất sang trọng. Rất hài lòng với trải nghiệm lái thử.", vehicle: "EVM S3 Standard" },
  { id: 3, name: "Lê Văn C", rating: 5, comment: "Thủ tục trả góp nhanh gọn. Phí sạc rẻ hơn xăng nhiều, đi lại tiết kiệm.", vehicle: "EVM T7 Luxury" },
  { id: 4, name: "Phạm Minh D", rating: 5, comment: "Công nghệ tự lái hoạt động mượt mà trên cao tốc. Rất đáng tiền!", vehicle: "EVM X5 Premium" },
  { id: 5, name: "Hoàng Tuấn E", rating: 4, comment: "Showroom hiện đại, nhân viên chuyên nghiệp. Xe giao đúng hẹn.", vehicle: "EVM S3 Standard" }
];

const CustomerFeedback = () => {
  // Nhân 3 danh sách để đủ dài
  const feedbacks = [...initialFeedbacks, ...initialFeedbacks, ...initialFeedbacks];

  return (
    <section className="py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Cộng Đồng Chủ Xe EVDMS</h2>
        <div className="inline-flex items-center bg-gray-50 px-6 py-2 rounded-full border border-gray-200">
          <span className="text-2xl font-bold text-gray-900 mr-3">4.7</span>
          <div className="flex space-x-1 mr-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-500 border-l border-gray-300 pl-4">Dựa trên 500+ đánh giá</span>
        </div>
      </div>

      <div className="w-full relative">
         {/* Fade Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        {/* Marquee Container - Chạy chậm hơn (40s) */}
        <div className="flex w-max animate-marquee gap-8 px-6" style={{ animationDuration: '40s' }}>
          {feedbacks.map((feedback, idx) => (
            <div 
              key={`${feedback.id}-${idx}`} 
              className="w-[400px] bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-gray-200 group-hover:text-blue-100 transition-colors" />
              
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>

              <p className="text-gray-700 text-lg mb-6 leading-relaxed font-medium">"{feedback.comment}"</p>
              
              <div className="flex items-center pt-4 border-t border-gray-200/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                    {feedback.name.charAt(0)}
                </div>
                <div>
                    <div className="font-bold text-gray-900">{feedback.name}</div>
                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">
                      {feedback.vehicle}
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerFeedback;