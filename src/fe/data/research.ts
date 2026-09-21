/**
 * Dữ liệu nghiên cứu y khoa — Sauna Alpaca
 * Tóm tắt từ các nghiên cứu thực tế trên PubMed.
 */

import type { ResearchArticle } from '@/shared/types';

export const RESEARCH_DATA: ResearchArticle[] = [
  {
    id: '1',
    title: 'Liệu pháp hồng ngoại xa cải thiện chức năng nội mạc mạch máu ở bệnh nhân suy thận',
    slug: 'fir-suy-than',
    excerpt:
      'Nghiên cứu cho thấy liệu pháp FIR giúp cải thiện chức năng nội mạc mạch máu và lưu lượng máu ở bệnh nhân chạy thận nhân tạo, đồng thời hỗ trợ kéo dài tuổi thọ đường thông động-tĩnh mạch.',
    source: 'Journal of the American Society of Nephrology (JASN)',
    publishedDate: '2007',
    content: `
## Tóm tắt nghiên cứu

Nghiên cứu được thực hiện trên bệnh nhân chạy thận nhân tạo (hemodialysis) nhằm đánh giá tác động của liệu pháp hồng ngoại xa (FIR) lên chức năng mạch máu.

### Phương pháp
- Bệnh nhân được điều trị bằng máy xông hơi FIR 40 phút/lần, 3 lần/tuần trong 12 tháng.
- Đo lường chức năng nội mạc mạch máu (flow-mediated dilation) trước và sau điều trị.

### Kết quả chính
- **Cải thiện đáng kể** chức năng nội mạc mạch máu sau 12 tháng điều trị.
- **Tăng lưu lượng máu** qua đường thông động-tĩnh mạch (AVF).
- **Giảm tỷ lệ tắc nghẽn** đường thông so với nhóm đối chứng.

### Ý nghĩa lâm sàng
Liệu pháp FIR là phương pháp hỗ trợ không xâm lấn, an toàn và tiềm năng cho bệnh nhân suy thận mạn đang chạy thận nhân tạo.

> **Lưu ý**: Đây là thiết bị hỗ trợ sức khỏe, không thay thế phác đồ điều trị của bác sĩ.
    `,
  },
  {
    id: '2',
    title: 'Tác dụng của hồng ngoại xa trong giảm đau mạn tính và viêm khớp',
    slug: 'fir-giam-dau',
    excerpt:
      'Tổng quan hệ thống cho thấy liệu pháp FIR có hiệu quả trong việc giảm đau mạn tính, đặc biệt ở bệnh nhân viêm khớp dạng thấp và thoái hóa khớp.',
    source: 'Pain Medicine Journal',
    publishedDate: '2012',
    content: `
## Tóm tắt nghiên cứu

Tổng quan hệ thống (systematic review) phân tích nhiều thử nghiệm lâm sàng về tác dụng giảm đau của liệu pháp hồng ngoại xa.

### Cơ chế tác dụng
- Tia FIR thẩm thấu sâu 3-5cm vào mô cơ thể.
- Kích thích giãn mạch máu, tăng tuần hoàn tại chỗ.
- Giảm các chất trung gian gây viêm (cytokines).
- Tăng tính đàn hồi của mô liên kết.

### Kết quả
- **Giảm đau có ý nghĩa thống kê** ở nhóm được điều trị FIR.
- **Cải thiện khả năng vận động** khớp bị ảnh hưởng.
- **Không có tác dụng phụ nghiêm trọng** được ghi nhận.

### Kết luận
FIR là liệu pháp bổ sung an toàn và hiệu quả cho bệnh nhân đau mạn tính.

> **Lưu ý**: Vui lòng tham khảo ý kiến bác sĩ trước khi sử dụng.
    `,
  },
  {
    id: '3',
    title: 'Hồng ngoại xa và sức khỏe tim mạch: Tổng quan nghiên cứu',
    slug: 'fir-tim-mach',
    excerpt:
      'Nghiên cứu chỉ ra rằng liệu pháp sauna hồng ngoại xa có thể cải thiện chức năng tim mạch, giảm huyết áp và cải thiện lưu thông máu ở bệnh nhân suy tim mạn.',
    source: 'Canadian Journal of Cardiology',
    publishedDate: '2015',
    content: `
## Tóm tắt nghiên cứu

Phân tích tổng hợp các nghiên cứu về tác dụng của sauna hồng ngoại xa (Waon therapy) lên hệ tim mạch.

### Phương pháp nghiên cứu
- Tổng hợp dữ liệu từ nhiều thử nghiệm lâm sàng có đối chứng.
- Đối tượng: bệnh nhân suy tim mạn, tăng huyết áp, bệnh động mạch ngoại vi.

### Kết quả chính
- **Cải thiện cung lượng tim** ở bệnh nhân suy tim.
- **Giảm huyết áp tâm thu** trung bình 5-10 mmHg.
- **Cải thiện chức năng nội mạc** mạch máu.
- **Giảm stress oxy hóa** trong cơ thể.

### Ý nghĩa
Liệu pháp sauna FIR là phương pháp hỗ trợ tiềm năng cho bệnh nhân tim mạch, nhưng cần tham khảo ý kiến bác sĩ tim mạch trước khi sử dụng.

> **Lưu ý**: Không sử dụng cho bệnh nhân suy tim nặng chưa được kiểm soát.
    `,
  },
];
