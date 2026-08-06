# Hướng Dẫn Trả Lời Phản Biện - Đề Tài: "Xây dựng website bán áo tự thiết kế"

Với nền tảng là C++ và PHP, bạn hoàn toàn có thể vượt qua buổi thi này một cách dễ dàng nếu hiểu được "bản chất" của Next.js (công nghệ bạn đang dùng).

Thực tế, Next.js phiên bản mới (App Router) cho phép bạn viết code **rất giống với mô hình của PHP**: Server sẽ kết nối trực tiếp vào Database, lấy dữ liệu ra, rồi nhúng vào HTML để gửi về cho trình duyệt.

Để thỏa mãn yêu cầu của giám khảo một cách nhanh gọn, chuyên nghiệp và đúng với công nghệ bạn đã chọn (Next.js, Tailwind, MySQL), bạn hãy làm theo các bước sau trong buổi thi:

## Bước 1: Trình bày ý tưởng với Giám khảo
Hãy nói với giám khảo:
> *"Em sẽ sử dụng **Next.js (App Router)** để tạo nhanh một trang Server Component. Cách này cho phép em kết nối cơ sở dữ liệu và lấy dữ liệu ngay trên Server (giống cách hoạt động của PHP) mà không cần phải viết API riêng lẻ, giúp tối ưu thời gian phát triển cho các trang đơn giản."*

## Bước 2: Tạo dự án mới (Gõ trên Terminal/CMD)
Mở terminal tại thư mục bạn muốn lưu bài thi và chạy lệnh sau để tạo một dự án Next.js mới (có sẵn Tailwind CSS để style cho đẹp):

```bash
npx create-next-app@latest bai-thi-demo --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```
*(Nếu terminal hỏi cấu hình, cứ nhấn Enter để chọn cấu hình mặc định hoặc Yes cho tất cả)*

Sau khi tải xong, di chuyển vào thư mục dự án:
```bash
cd bai-thi-demo
```

## Bước 3: Cài đặt thư viện kết nối MySQL
Giống như PHP cần PDO, Node.js cần một thư viện để giao tiếp với MySQL. Trong luận văn của bạn dùng thư viện `mysql2`, nên ta sẽ cài nó:
```bash
npm install mysql2
```

## Bước 4: Viết code cho trang hiển thị đơn hàng
Mở dự án vừa tạo bằng VS Code. Tìm đến file `src/app/page.tsx` (đây là trang chủ của Next.js, giống như file `index.php`).

Xóa hết toàn bộ code mặc định trong file này và dán đoạn code sau vào:

```tsx
import mysql from 'mysql2/promise';

// 1. Hàm kết nối và lấy dữ liệu từ MySQL (Chạy hoàn toàn trên Server)
async function getOrders() {
  // Kết nối đến database teestudio (Hãy đổi user/password cho đúng với máy thi của bạn)
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'teestudio'
  });
  
  // Viết câu lệnh SQL giống hệt như học ở trường
  const [rows] = await connection.query('SELECT * FROM customerorder ORDER BY createdAt DESC LIMIT 10');
  await connection.end();
  
  return rows as any[];
}

// 2. Giao diện trang web (Render ra HTML)
export default async function OrdersPage() {
  // Gọi hàm lấy dữ liệu ở trên
  const orders = await getOrders(); 

  // Trả về HTML (được viết bằng cú pháp JSX của React)
  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Danh sách Đơn hàng (Bài thi)</h1>
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left border-collapse bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border-b p-4">Mã Đơn (Code)</th>
              <th className="border-b p-4">ID Khách Hàng</th>
              <th className="border-b p-4">Tổng tiền (VNĐ)</th>
              <th className="border-b p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {/* Dùng hàm map() để duyệt qua mảng dữ liệu (Giống vòng lặp foreach trong PHP) */}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border-b p-4 font-medium">{order.orderCode}</td>
                <td className="border-b p-4">{order.userId}</td>
                <td className="border-b p-4 text-red-500 font-bold">
                  {Number(order.totalAmount).toLocaleString('vi-VN')} đ
                </td>
                <td className="border-b p-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Bước 5: Khởi chạy dự án để giám khảo xem
Mở terminal trong thư mục `bai-thi-demo` và gõ lệnh chạy Server:
```bash
npm run dev
```
Sau đó mở trình duyệt và truy cập vào địa chỉ: `http://localhost:3000`. Trang danh sách đơn hàng sẽ hiện lên rất đẹp mắt nhờ Tailwind CSS.

---

## 💡 Mẹo trả lời khi Giám khảo hỏi thêm về đoạn code trên:

**1. Nếu thầy/cô hỏi: "Tại sao em viết code lấy Database chung file với code giao diện được?"** 
> **Bạn trả lời:** "Vì em sử dụng tính năng **React Server Components** của Next.js (App Router). Đoạn code kết nối DB chỉ chạy trên Server Node.js (giống hệt cách hoạt động của PHP), sau đó nó render ra HTML thuần rồi mới gửi xuống trình duyệt. Cách này rất bảo mật và không bị lộ thông tin cấu hình Database ra ngoài."

**2. Nếu thầy/cô hỏi: "Làm sao nó lặp dữ liệu được ra bảng?"** 
> **Bạn trả lời:** "Trong React, thay vì dùng vòng lặp `foreach` như PHP hay C++, tụi em dùng hàm `map()` của mảng Javascript để tự động in ra các thẻ `<tr>` tương ứng với mỗi dòng dữ liệu lấy từ Database."

**Chúc bạn bình tĩnh và có một buổi bảo vệ luận án thật thành công! Bạn chỉ cần nhớ nó rất giống PHP, chỉ là viết bằng ngôn ngữ Javascript/Typescript mà thôi.**
