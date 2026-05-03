import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// İndirdiğin font dosyasının doğru yolu. 
import '../assets/fonts/Roboto-Regular-normal.js'; 

export const generatePlanPDF = (plan, user) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Font dönüştürücüde fonta verdiğin isim
  const fontName = 'Roboto-Regular'; 

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14; 

  // Ana başlık
  doc.setFont(fontName, 'normal'); 
  doc.setFontSize(20);
  doc.text('ÇALIŞMA PLANI', pageWidth / 2, 20, { align: 'center' });

  // Tarih
  doc.setFontSize(10);
  const today = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Oluşturulma Tarihi: ${today}`, margin, 35);

  // Kullanıcı bilgileri
  if (user) {
    doc.text(`Öğrenci: ${user.name}`, margin, 42);
    doc.text(`Email: ${user.email}`, margin, 47);
  }

  // Ayırıcı çizgi
  doc.setLineWidth(0.5);
  doc.line(margin, 52, pageWidth - margin, 52);

  // Alt Başlık
  doc.setFontSize(12);
  doc.text('HAFTALIK ÇALIŞMA PROGRAMI', margin, 62);

  // Tablo verilerini hazırlama
  const tableRows = [];
  
  if (plan && plan.length > 0) {
    plan.forEach((gunPlan) => {
      if (gunPlan.dersler && gunPlan.dersler.length > 0) {
        gunPlan.dersler.forEach((ders) => {
          tableRows.push([
            gunPlan.gun,
            ders.dersAdi,
            ders.konuAdi,
            `${ders.sure} saat`,
            ders.zorluk
          ]);
        });
      }
    });
  }

  // Eğer plan boşsa gösterilecek mesaj
  if (tableRows.length === 0) {
    tableRows.push([{ content: 'Planlanmış ders bulunmamaktadır.', colSpan: 5, styles: { halign: 'center' } }]);
  }

  // AutoTable ile Tabloyu Çizdirme
  autoTable(doc, {
    startY: 68,
    head: [['Gün', 'Ders', 'Konu', 'Süre', 'Zorluk']],
    body: tableRows,
    styles: { 
      font: fontName, // Türkçe karakterlerin tabloda bozulmaması için
      fontSize: 10,
      cellPadding: 4
    },
    headStyles: { 
      fillColor: [63, 81, 181], // Mavi başlık
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { 
      fillColor: [245, 245, 245] 
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 45 },
      2: { cellWidth: 'auto' }, // Uzun konular taşmaz, alt satıra geçer
      3: { cellWidth: 20 },
      4: { cellWidth: 20 }
    }
  });

  // Notlar bölümü (Dinamik Y pozisyonu: Tablo nerede bittiyse oradan başlar)
  let finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setFontSize(10);
  doc.text('NOTLAR:', margin, finalY);
  finalY += 7;
  
  doc.setFontSize(9);
  const notes = [
    '• Bu plan Ders Asistanı uygulaması tarafından otomatik olarak oluşturulmuştur.',
    '• Plan, genetik algoritma kullanılarak optimize edilmiştir.',
    '• Çalışma saatlerini kendi kapasitenize göre ayarlayınız.',
    '• Düzenli çalışma için plana sadık kalın.'
  ];
  
  notes.forEach(note => {
    doc.text(note, margin, finalY);
    finalY += 5;
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.text('Ders Asistanım - Akıllı Çalışma Planlayıcı', pageWidth / 2, footerY, { align: 'center' });

  return doc;
};

// İSMİNİ SENİN COMPONENTİNE GÖRE "planiPDFIndir" OLARAK DEĞİŞTİRDİM
export const planiPDFIndir = (plan, user, fileName = 'calisma-plani.pdf') => {
  try {
    const doc = generatePlanPDF(plan, user);
    
    const pdfBlob = doc.output('blob');
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
    
    return { success: true };
  } catch (error) {
    console.error('PDF indirme hatası:', error);
    return { success: false, error: error.message };
  }
};

export default {
  generatePlanPDF,
  planiPDFIndir
};