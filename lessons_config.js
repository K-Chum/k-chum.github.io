// =========================================================================
// Lessons Configuration (lessons_config.js)
// Add new lesson modules by appending items to the LESSONS_CONFIG array.
// This works dynamically on GitHub Pages and local file:// protocols.
// =========================================================================

const LESSONS_CONFIG = [
  {
    id: "measurement-sf",
    title: "การวัดและเลขนัยสำคัญ",
    description: "เรียนรู้หลักการวัดทางวิทยาศาสตร์ วิธีอ่านค่าสเกลไม้บรรทัดอย่างละเอียด หลักเกณฑ์การนับเลขนัยสำคัญ และการคำนวณความคลาดเคลื่อนสะสมในการทดลอง",
    grade: "ม.4",
    type: "ทฤษฎี & สไลด์",
    url: "m4/measurement-sf/index.html",
    accent: "meas",
    status: "available"
  },
  {
    id: "analog-multimeter",
    title: "มัลติมิเตอร์แอนะล็อก",
    description: "ทำความเข้าใจขีดวัดและการทำงานของมัลติมิเตอร์แบบเข็ม อ่านสเกลระดับแรงดันไฟฟ้า DC ในย่านวัด 5V, 10V, 50V และ 1000V พร้อมแบบฝึกอ่านค่าเสมือนจริง",
    grade: "ม.4",
    type: "ทฤษฎี & ปฏิบัติ",
    url: "m4/analog_multimeter/index.html",
    accent: "multi",
    status: "available"
  },
  {
    id: "lim-fund-derivative",
    title: "ลิมิตและพื้นฐานการหาอนุพันธ์",
    description: "เรียนรู้แนวคิดลิมิตของฟังก์ชัน ลิมิตซ้าย-ขวา คุณสมบัติของลิมิต รูปแบบไม่กำหนด ความต่อเนื่อง และบทนำสู่อนุพันธ์พหุนามพร้อมกราฟปฏิสัมพันธ์",
    grade: "ม.6",
    type: "ทฤษฎี & สไลด์",
    url: "m6/lim-fund_derivative/index.html",
    accent: "math",
    status: "available"
  },
  {
    id: "3d_shape-viewer",
    title: "ดูแบบจำลองรูปทรง 3 มิติ (3D Shape Viewer)",
    description: "เครื่องมือโหลดและสำรวจโมเดล 3 มิติแบบ 360 องศา",
    grade: "ม.3",
    type: "ห้องปฏิบัติการเสมือนจริง",
    url: "m3/3d_shape-viewer/index.html",
    accent: "shapes",
    status: "available"
  },
  {
    id: "waves-properties",
    title: "คลื่นและคลื่นแม่เหล็กไฟฟ้า",
    description: "ทำความเข้าใจความหมายและประเภทของคลื่น ส่วนประกอบที่สำคัญ สูตรคำนวณความเร็วคลื่น ตลอดจนทฤษฎีแมกซ์เวลล์และคุณประโยชน์รวมถึงภัยอันตรายของคลื่นแม่เหล็กไฟฟ้าแต่ละย่าน",
    grade: "ม.3",
    type: "ทฤษฎี & สไลด์",
    url: "m3/waves/index.html",
    accent: "waves",
    status: "available"
  }
];
