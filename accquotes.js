
    
async function exportFilteredTable() {
    const startDateInput = document.getElementById("startDate").value;
    const endDateInput = document.getElementById("endDate").value;
    const startDate = startDateInput ? new Date(startDateInput) : null;
    const endDate = endDateInput ? new Date(endDateInput) : null;
    if (endDate) endDate.setHours(23, 59, 59, 999);

    const dataTable = $('#dataTable').DataTable();

    // Ambil SEMUA data dari seluruh halaman
    const allRows = dataTable.rows({ search: 'applied' }).data().toArray();

    const exportData = [];

    const header = [
        "Quotation Date", "Quotation #", "Sales", "Customer", "Status", "OC #",
        "Nama Barang", "Subtotal", "PPN", "Total All"
    ];
    exportData.push(header);

    for (const row of allRows) {
        // row adalah array dari kolom
        const rawDate = $('<div>').html(row[1]).text().trim();  // Ambil teks dari HTML
        const parts = rawDate.split("-");
        const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : rawDate;
        const rowDate = new Date(formattedDate);

        if (startDate && endDate) {
            if (rowDate < startDate || rowDate > endDate) continue;
        }

        const quotes = $('<div>').html(row[2]).text().trim();
        const sales = $('<div>').html(row[3]).text().trim();
        const customer = $('<div>').html(row[4]).text().trim();
        const status = $('<div>').html(row[5]).text().trim();
        const oc = $('<div>').html(row[6]).text().trim();

        let namabarang = "-", subtotal = "", ppn = "", totalall = "";

        try {
            const res = await fetch(`get_data_quotes.php?quotes=${encodeURIComponent(quotes)}`);
            const data = await res.json();
            if (data && !data.error) {
                namabarang = data.dataBarangOC?.map(item => item.namabarang).join(", ") || "-";
                subtotal = data.subtotal ?? "";
                ppn = data.ppn ?? "";
                totalall = data.totalall ?? "";
            }
        } catch (e) {
            console.error("Gagal ambil data quotes:", e);
        }

        exportData.push([
            rawDate, quotes, sales, customer, status, oc,
            namabarang, subtotal, ppn, totalall
        ]);
    }

    // Buat worksheet Excel
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // Lebar kolom otomatis
    const columnWidths = header.map((_, colIndex) => {
        const maxLength = exportData.reduce((max, row) => {
            const cell = row[colIndex];
            const len = cell ? cell.toString().length : 0;
            return Math.max(max, len);
        }, 10);
        return { wch: maxLength + 2 };
    });
    ws['!cols'] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export Quotes");
    XLSX.writeFile(wb, "export_quotes.xlsx");
}

    $(document).ready(function() {
    loadNotifications();
});




 function closeModal() {
            document.getElementById('myModal').style.display = 'none';
        }
// Mendapatkan elemen modal
var modal = document.getElementById("myModal");

// Menambahkan event listener ke body untuk menutup modal saat klik di luar
document.body.addEventListener("click", function(event) {
  // Mengecek apakah target klik tidak sama dengan elemen modal dan tidak berada di dalam elemen modal
  if (event.target!== modal &&!modal.contains(event.target)) {
    // Menutup modal
    modal.style.display = "none";
  }
});


        var modal = document.getElementById('myModal');

    // Ketika pengguna mengklik di luar modul, tutup modulnya
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Tombol close di dalam modul untuk menutup modul saat diklik
    var closeButton = document.querySelector('.close');
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });


    document.addEventListener("DOMContentLoaded", function() {
        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        var infoButtons = document.querySelectorAll('.infoButton'); // Mengganti editButtons menjadi infoButtons

        span.onclick = function() {
            modal.style.display = "none";
        };

        // Deklarasikan variabel infoButtons
        var infoButtons;

        infoButtons.forEach(function(button) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                var quotes = this.dataset.quotes;

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

                xhr.open('GET', 'get_barang.php?quotes=' + encodeURIComponent(quotes), true);
                xhr.send();
            });
        });

     function showDetails(barang) {
    // Bersihkan isi tabel sebelum menambahkan data baru
    document.getElementById("barangTableBody").innerHTML = "";

    var nomor = 1; // Nomor awal

    // Tambahkan data barang ke dalam tabel
    barang.forEach(function(item) {
        var row = document.createElement("tr");
        row.innerHTML = "<td>" + nomor++ + "</td>" +
                        "<td>" + item.namabarang + "</td>" +
                        "<td>" + item.qty + "</td>" +
                        "<td>" + item.satuan + "</td>" +
                        "<td>" + item.price + "</td>" +

                        "<td>" + item.discount + "</td>" +

                        "<td>" + item.totalprice + "</td>";
        document.getElementById("barangTableBody").appendChild(row);
    });


            // Set nilai quotesDisplay dan salesDisplay

            document.getElementById("quotesDisplay").textContent = barang[0].quotes; // Ubah sesuai struktur JSON yang diterima


            document.getElementById("namacustomerDisplay").textContent = barang[0].namacustomer; // Ubah sesuai struktur JSON yang 


            document.getElementById("emailDisplay").textContent = barang[0].email; // Ubah sesuai struktur JSON yang 

    emailDisplay.textContent = barang[0].email; // Set teks email
    emailDisplay.href = "mailto:" + barang[0].email; // Set tautan email


            document.getElementById("telpDisplay").textContent = barang[0].telp; // Ubah sesuai struktur JSON yang 
            
    telpDisplay.textContent = barang[0].telp; // Set teks telepon
    telpDisplay.href = "tel:" + barang[0].telp; // Set tautan telepon


            document.getElementById("cpDisplay").textContent = barang[0].cp; // Ubah sesuai struktur JSON yang 


            // document.getElementById("alamatDisplay").textContent = barang[0].alamat; // Ubah sesuai struktur JSON yang 



        // Proses dan tampilkan notes dengan setiap baris diawali tanda *
        var notes = barang[0].notes || ""; // Pastikan notes ada atau berikan string kosong
        var lines = notes.split('\n'); // Pecah teks menjadi baris-baris
        var formattedNotes = lines.map(line => " " + line.trim()).join('<br>'); // Tambahkan * di awal setiap baris dan gabungkan kembali dengan <br>
        document.getElementById("notesDisplay").innerHTML = formattedNotes; // Gunakan innerHTML agar format asli tetap terjaga





            document.getElementById("statusDisplay").textContent = barang[0].status; // Ubah sesuai struktur JSON yang diterima

         // Menyembunyikan gambar jika statusDisplay adalah "PENDING APPROVAL"
    if (barang[0].status === "PENDING APPROVAL") {
        document.getElementById("logo").style.display = "none"; // Sembunyikan gambar
    } else {
        document.getElementById("logo").style.display = "block"; // Tampilkan gambar
    }


            document.getElementById("subtotalDisplay").textContent = barang[0].subtotal; // Ubah sesuai struktur JSON yang diterima
            document.getElementById("tglquotesDisplay").textContent = barang[0].tglquotes; // Ubah sesuai struktur JSON yang diterima
            document.getElementById("ppnDisplay").textContent = barang[0].ppn; // Ubah sesuai struktur JSON yang diterima
            document.getElementById("totalallDisplay").textContent = barang[0].totalall; // Ubah sesuai struktur JSON yang diterima


            modal.style.display = "block";
        }
    });
function updateStatusReject(quotes) {
    Swal.fire({
        title: 'Yakin ingin Reject?',
        text: "Anda akan menolak penawaran dengan nomor: " + quotes,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Reject',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            // Kirim permintaan AJAX ke updatereject.php
            $.ajax({
                url: 'updatereject.php',
                method: 'POST',
                data: { quotes: quotes },
                success: function(response) {
                    const res = JSON.parse(response);
                    if (res.status === 'success') {
                        // Tampilkan notifikasi sukses
                        Swal.fire('Berhasil!', res.message, 'success');
                        // Tampilkan notifikasi selama 2 detik
                        setTimeout(() => {
                            location.reload(); // Refresh halaman setelah 2 detik
                        }, 2000);
                    } else {
                        Swal.fire('Error!', res.message, 'error');
                    }
                },
                error: function() {
                    Swal.fire('Error!', 'Terjadi kesalahan saat menghubungi server.', 'error');
                }
            });
        } else {
            Swal.fire('Penolakan dibatalkan!');
        }
    });
}

function updateStatus(quotes) {
    console.log('Checking price differences for quotes:', quotes); // 🔍

    $.ajax({
        url: 'cek_perbedaan_harga.php',
        type: 'POST',
        dataType: 'json',
        data: { quotes: quotes },

        success: function (res) {
            console.log('Response from cek_perbedaan_harga.php:', res); // 🧾

            // ✅ Cek jika ada data mismatch
            if (res.data && res.data.length > 0) {
                console.log('Mismatch detected:', res.data); // 🔴

                let htmlMismatch = res.data.map(item => {
                    return `<b>${item.nama}</b><br>
                            <b>Harga Pengajuan : Rp. ${item.harga_form}</b><br>
                            <span style="color:red">Harga Jual Terakhir : Rp. ${item.harga_lama}</span><br>

                             <span style="color:red">OC Terakhir : ${item.oc_terakhir}</span><br>
`;
                }).join('');

                Swal.fire({
                    title: 'Perbedaan Harga Ditemukan',
                    html: htmlMismatch + '<hr>Apakah Anda tetap ingin melanjutkan?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Lanjutkan',
                    cancelButtonText: 'Batal'
                }).then((result) => {
                    if (result.isConfirmed) {
                        kirimUpdateStatus(quotes);
                    }
                });

            } else {
                console.log('No mismatch, proceeding with confirmation...'); // ✅

                Swal.fire({
                    title: `Apakah Yakin Ingin Menyetujui Quotes ${quotes}?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Ya',
                    cancelButtonText: 'Tidak'
                }).then((result) => {
                    if (result.isConfirmed) {
                        kirimUpdateStatus(quotes);
                    }
                });
            }
        },

        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengecek Harga',
                text: 'Terjadi kesalahan saat pengecekan harga.'
            });
            console.error('Error cek_perbedaan_harga.php:', xhr.responseText); // ❌
        }
    });
}


function kirimUpdateStatus(quotes) {
    Swal.fire({
        title: 'Sedang Mengirim Email QUOTES...',
        text: 'Harap tunggu sebentar.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: 'update_status.php',
        type: 'POST',
        data: { quotes: quotes },
        success: function (response) {
            Swal.close();
            console.log('Response from update_status.php:', response); // 📧

            if (response === 'Email Sent') {
                Swal.fire({
                    icon: 'success',
                    title: `Penawaran ${quotes} berhasil dikirim ke Customer`,
                    showConfirmButton: false,
                    timer: 5000
                }).then(() => {
                    window.location.href = 'daftarquotes';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal mengupdate status QUOTES',
                    text: 'Terjadi kesalahan saat update.'
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan AJAX',
                text: 'Terjadi kesalahan saat mengirim permintaan.'
            });
            console.error('Error update_status.php:', xhr.responseText); // ❌
        }
    });
}

$(document).ready(function () {
    $('#dataTable').DataTable({
        "ordering": false,   // ❌ matikan sorting
        "searching": true,   // ✔ pencarian tetap aktif
        "paging": true,      // ✔ paging aktif
        "info": true,        // ✔ tampil info jumlah baris
        "pageLength": 20     // default tampil 20 baris
    });
});

