
function exportFilteredTable() {
    const startDateStr = document.getElementById("startDate").value;
    const endDateStr = document.getElementById("endDate").value;

    if (!startDateStr || !endDateStr) {
        alert("Silakan pilih kedua tanggal terlebih dahulu.");
        return;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr + "T23:59:59");

    const table = $('#dataTable').DataTable();
    const allData = table.rows().data(); // Ambil semua data, termasuk yang tidak terlihat

    const exportData = [];

    // Ambil header tanpa kolom "Action" (indeks 0)
    const headers = table.columns().header().toArray().slice(1).map(th => th.innerText.trim());
    exportData.push(headers);

    allData.each(function(rowData) {
        const tglspkText = rowData[1]; // Asumsikan kolom ke-2 adalah TGL SPK
        const tglspk = new Date(tglspkText);

        if (tglspk >= startDate && tglspk <= endDate) {
            const filteredRow = rowData.slice(1); // Hilangkan kolom Action
            exportData.push(filteredRow.map(cell => {
                // Strip HTML tags (jika ada tombol dalam cell)
                const div = document.createElement("div");
                div.innerHTML = cell;
                return div.textContent || div.innerText || "";
            }));
        }
    });

    if (exportData.length <= 1) {
        alert("Tidak ada data sesuai tanggal yang dipilih.");
        return;
    }

    // Buat worksheet dan atur auto width
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    worksheet['!cols'] = exportData[0].map((_, i) => {
        const maxLen = Math.max(...exportData.map(r => (r[i] ? r[i].toString().length : 10)));
        return { wch: maxLen + 2 };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data SPK");

    XLSX.writeFile(workbook, `Data_SPK_${startDateStr}_sampai_${endDateStr}.xlsx`);
}


$(document).ready(function () {
    $('#dataTable').DataTable({
        "ordering": false,    // Hilangkan semua fitur sort + panah
        "searching": true,    // Pencarian tetap aktif
        "paging": true,       // Paging aktif
        "info": true,         // Info jumlah baris
        "pageLength": 20      // Default tampil 20 baris
    });
});


 function closeModal() {
            document.getElementById('myModal').style.display = 'none';
        }
// Mendapatkan elemen modal
var modal = document.getElementById("myModal");

// Menambahkan event listener ke body untuk menutup modal saat lik di luar
document.body.addEventListener("click", function(event) {
  // Mengecek apakah target klik tidak sama dengan elemen modal dan tidak berada di dalam elemen modal
  if (event.target!== modal &&!modal.contains(event.target)) {
    // Menutup modal
    modal.style.display = "none";
  }
});

 document.addEventListener("DOMContentLoaded", function() {
  var modal = document.getElementById("myModal");
  var span = document.getElementsByClassName("close")[0];
  var infoButtons = document.querySelectorAll('.infoButton'); // Mengganti editButtons menjadi infoButtons


  // Deklarasikan variabel infoButtons
  var infoButtons;

  infoButtons.forEach(function(button) {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      var spk = this.dataset.spk;

      // Kirim permintaan AJAX ke PHP untuk mengambil data barang
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            showDetails(data.barang); // Ubah sesuai struktur JSON yang diterima
          } else {
            alert("Gagal mengambil data dari server.");
          }
        }
      };

      xhr.open('GET', 'get_spkk.php?spk=' + encodeURIComponent(spk), true);
      xhr.send();
    });
  });

  function showDetails(barang) {
    // Bersihkan isi tabel sebelum menambahkan data baru
    document.getElementById("barangTableBody").innerHTML = "";

    var nomor = 1;

    // Tambahkan data barang ke dalam tabel
    barang.forEach(function(item) {
      var row = document.createElement("tr");
      row.innerHTML = " <td>" + nomor++ + "</td>  <td>" + item.namabarang + "</td>  <td>" + item.qty + "</td>   <td>" + item.satuan + "</td>     " ;
      document.getElementById("barangTableBody").appendChild(row);
    });







        // Proses dan tampilkan notes dengan setiap baris diawali tanda *
        var notes = barang[0].notespk || ""; // Pastikan notes ada atau berikan string kosong
        var lines = notes.split('\n'); // Pecah teks menjadi baris-baris
        var formattedNotes = lines.map(line => " " + line.trim()).join('<br>'); // Tambahkan * di awal setiap baris dan gabungkan kembali dengan <br>
        document.getElementById("notesDisplay").innerHTML = formattedNotes; // Gunakan innerHTML agar format asli tetap terjaga



    // Set nilai quotesDisplay dan salesDisplay
    document.getElementById("spkDisplay").textContent = barang[0].spk; // Ubah sesuai struktur JSON yang diterima

    document.getElementById("tglspkDisplay").textContent = barang[0].tglspk; // Ubah sesuai struktur JSON yang diterima

    document.getElementById("alamatDisplay").textContent = barang[0].alamat; // Ubah sesuai struktur JSON yang diterima

     document.getElementById("ocDisplay").textContent = barang[0].oc; // Ubah sesuai struktur JSON yang diterima

     document.getElementById("tglocDisplay").textContent = barang[0].tglpo; // Ubah sesuai struktur JSON yang diterima
     document.getElementById("poDisplay").textContent = barang[0].pocust; // Ubah sesuai struktur JSON yang diterima
     document.getElementById("tglocDisplay").textContent = barang[0].tglpo; // Ubah sesuai struktur JSON yang diterima
     document.getElementById("namacustomerDisplay").textContent = barang[0].namacustomer; // Ubah sesuai struktur JSON yang diterima
    modal.style.display = "block";
  }
});

