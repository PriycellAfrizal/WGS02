function checkPO(button) {
    const poNumber = button.getAttribute('data-nopo');
    const barangJson = button.getAttribute('data-barang');

    let barangList;
    try {
        barangList = JSON.parse(barangJson);
    } catch (e) {
        console.error("Gagal parse JSON data-barang:", barangJson);
        Swal.fire('Error!', 'Data barang tidak valid.', 'error');
        return;
    }

    console.log("📦 Barang:", barangList);
    console.log("📄 PO Number:", poNumber);

    $.ajax({
        url: 'compare_po_prices.php',
        type: 'POST',
        data: {
            po_number: poNumber,
            barang: JSON.stringify(barangList)
        },
        dataType: 'json',
        success: function(compareResult) {
            console.log("✅ Compare Result:", compareResult);

            if (compareResult.length > 0) {
                let htmlMessage = `
                    <table style="width:100%; border-collapse: collapse; text-align:left;">
                        <thead>
                            <tr>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">Nama Barang</th>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">Harga Sekarang</th>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">Harga Sebelumnya</th>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">PO Lama</th>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">Perubahan</th>
                            </tr>
                        </thead>
                        <tbody>`;

                compareResult.forEach(item => {
                    const isNaik = item.price_baru > item.price_lama;
                    const arah = isNaik ? 'Naik' : 'Turun';
                    const selisihPersen = Math.abs(item.selisih).toFixed(2);
                    const warnaTeks = isNaik ? 'red' : 'green';
                    const warnaBackground = isNaik ? '#ffecec' : '#e7fbe7';

                    htmlMessage += `
                        <tr style="background-color: ${warnaBackground};">
                            <td style="padding:6px;">${item.namabarang}</td>
                            <td style="padding:6px;">Rp${formatRupiah(item.price_baru)}</td>
                            <td style="padding:6px;">Rp${formatRupiah(item.price_lama)}</td>
                            <td style="padding:6px;">${item.nopo_lama}</td>
                            <td style="padding:6px; color:${warnaTeks}; font-weight:bold;" title="Harga ${arah} ${selisihPersen}% dibanding sebelumnya">
                                ${arah} ${selisihPersen}%
                            </td>
                        </tr>`;
                });

                htmlMessage += `</tbody></table>`;

                Swal.fire({
                    title: 'Perbedaan Harga Ditemukan!',
                    html: htmlMessage,
                    icon: 'warning',
                    width: '800px',
                    showCancelButton: true,
                    confirmButtonText: 'Tetap ACC',
                    cancelButtonText: 'Batal'
                }).then((innerResult) => {
                    if (innerResult.isConfirmed) {
                        accPO(poNumber);
                    }
                });

            } else {
                // Tidak ada perbedaan harga
                accPO(poNumber);
            }
        },
        error: function(xhr, status, error) {
            console.error("❌ AJAX ERROR:", error);
            Swal.fire('Error!', 'Gagal membandingkan harga PO.', 'error');
        }
    });
}

function accPO(poNumber) {
    $.ajax({
        url: 'update_po_status.php',
        type: 'POST',
        data: {
            po_number: poNumber,
            status: 'APPROVED'
        },
        success: function(response) {
            Swal.fire('ACC PO!', `PO ${poNumber} telah di-ACC.`, 'success')
                .then(() => location.reload());
        },
        error: function(xhr, status, error) {
            console.error("❌ Update PO ERROR:", error);
            Swal.fire('Error!', 'Terjadi kesalahan saat mengupdate PO.', 'error');
        }
    });
}

function formatRupiah(number) {
    return Number(number).toLocaleString('id-ID');
}



    var modal = document.getElementById('myModal');
    var modalOpen = false; // Tambahkan variabel untuk status modal

    // Fungsi untuk menutup modal
    function closeModal() {
        modal.style.display = 'none';
        modalOpen = false; // Set modalOpen menjadi false saat modal ditutup
        console.log('Modal closed');
    }

    
// Function untuk membuka modal dan mengisi dengan data terkait nopo
function openModal(button) {
    if (modalOpen) return; // Jika modal sudah terbuka, tidak perlu membuka lagi

    var nopo = button.getAttribute('data-nopo'); // Ambil nilai atribut data-nopo dari tombol yang ditekan

    // Tampilkan modal
    modal.style.display = 'block';
    modalOpen = true; // Set modalOpen menjadi true saat modal dibuka
    console.log('Modal opened');

    // Menggunakan AJAX untuk mengambil data terkait nopo
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Parsing data JSON yang dikirim dari server
            var data = JSON.parse(this.responseText);

            // Memasukkan nilai nopo ke dalam modal
            document.getElementById('cpDisplay').innerText = data.cp;
            document.getElementById('telpDisplay').innerText = data.telp;
            document.getElementById('nopoDisplay').innerText = data.nopo;
            document.getElementById('namasuplierDisplay').innerText = data.namasuplier;
            document.getElementById('tglpoDisplay').innerText = data.tglpo;

            // Mengisi informasi barang ke dalam tabel
            var tableBody = document.getElementById('barangTableBody');
            tableBody.innerHTML = '';
            data.barang.forEach(function(item, index) {
                var row = tableBody.insertRow();
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);
                var cell6 = row.insertCell(5);
                var cell7 = row.insertCell(6);
                var cell8 = row.insertCell(7); // Menambahkan cell untuk permintaan

                cell1.innerText = index + 1; // Nomor urut
                cell2.innerText = item.namabarang; 

                cell2.innerHTML = '<a href="javascript:void(0);" onclick="openBarangHistoryModal(\'' + item.namabarang + '\')" style="text-decoration: underline; text-decoration-color: blue;">' + item.namabarang + '</a>';

                cell3.innerText = item.qty; // Qty
                cell4.innerText = item.satuan; // Satuan

                cell5.innerText =  item.price; // Harga Satuan
                cell6.innerText = item.totalprice; // Total Harga
                cell7.innerText = item.nosp; // No. SP


                // Mengambil data qty dari splocal
                var xhttpQty = new XMLHttpRequest();
                xhttpQty.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var qtyData = JSON.parse(this.responseText);
                        cell8.innerText = qtyData.remarks; // Mengisi nilai qty
                    }
                };
                xhttpQty.open("GET", "purchaselocal/get_qtysplocal.php?nosp=" + item.nosp + "&namabarang=" + encodeURIComponent(item.namabarang), true);
                xhttpQty.send();
            });

            // Mengisi informasi subtotal, PPN, dan Total All
            document.getElementById('subtotalDisplay').innerText = data.subtotal;
            document.getElementById('ppnDisplay').innerText = data.ppnAmount;

            document.getElementById('discountallDisplay').innerText = data.discountall;

            document.getElementById('totalallDisplay').innerText = data.totalall;

            // Memasukkan data posuratjalan ke dalam tabel
            var sjTableBody = document.getElementById('suratjalanTableBody');
            sjTableBody.innerHTML = '';
            if (data.posuratjalan) {
                data.posuratjalan.forEach(function(sjItem, index) {
                    var sjRow = sjTableBody.insertRow();
                    var cell1 = sjRow.insertCell(0);
                    var cell2 = sjRow.insertCell(1);
                    var cell3 = sjRow.insertCell(2);
                    var cell4 = sjRow.insertCell(3);
                    var cell5 = sjRow.insertCell(4);
                    var cell6 = sjRow.insertCell(5); // Tambahkan cell untuk nomor urut

                    cell1.innerText = index + 1; // Nomor urut
                    cell2.innerText = sjItem.nosuratjalan;
                    cell3.innerText = sjItem.tglsj;
                    cell4.innerText = sjItem.namabarang;
                    cell5.innerText = sjItem.qty;
                    cell6.innerText = sjItem.nosp;
                });
            }

         // New AJAX request for pembayaranttfp
var xhttpPembayaran = new XMLHttpRequest();
xhttpPembayaran.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var pembayaranData = JSON.parse(this.responseText);

        // Menambahkan data ke table penagihanTable
        var tableBody = document.getElementById('PenagihanTableBody');
        tableBody.innerHTML = ''; // Clear previous rows

        // Check if pembayaranData is empty
        if (pembayaranData.length === 0) {
            // If no data, show "Belum ada Riwayat Pembayaran"
            var row = tableBody.insertRow();
            var cell = row.insertCell(0);
            cell.colSpan = 7; // Span across all columns
            cell.innerText = 'Belum ada Riwayat Pembayaran';
            cell.style.textAlign = 'center'; // Optional: Center the message
            cell.style.fontStyle = 'italic'; // Optional: Italicize the message
        } else {
            // If data exists, populate the table with data
            pembayaranData.forEach(function(pembayaran, index) {
                var row = tableBody.insertRow();
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);
                var cell6 = row.insertCell(5);
                var cell7 = row.insertCell(6);

                cell1.innerText = index + 1;
                cell2.innerText = pembayaran.tanggal;
                cell3.innerText = pembayaran.nofp;
                cell4.innerText = pembayaran.noinvoice;
                cell5.innerText = pembayaran.nott;
                cell6.innerText = pembayaran.bank;
                cell7.innerText = pembayaran.totalall;
            });
        }
    }
};
xhttpPembayaran.open("GET", "get_pembayaranttfp.php?nopo=" + nopo, true);
xhttpPembayaran.send();

        }
    };




    
    xhttp.open("GET", "purchaselocal/get_Historypo.php?nopo=" + nopo, true);
    xhttp.send();
}




function openBarangHistoryModal(namabarang)  {
    // Set the title for the item
    const namabarangTitle = document.getElementById('namabarangTitle');
    namabarangTitle.innerText = namabarang;  // Display the item name in the modal header

    // Fetch OC details for the given 'namabarang'
    fetch(`get_history_po.php?namabarang=${encodeURIComponent(namabarang)}`)
        .then(response => response.json())  // Parse JSON response
        .then(data => {
            const orderDetailsTableBody = document.getElementById("orderDetailsTableBody");
            orderDetailsTableBody.innerHTML = "";  // Clear previous data

            // Check if data exists
            if (data && data.length > 0) {
                // Populate the table with the fetched OC details
                data.forEach(item => {
                    const row = document.createElement("tr");

                    // Create table rows with OC data
                    row.innerHTML = `
                        <td>${item.tglpo}</td>
                        <td>${item.nopo}</td>
                        <td>${item.namasuplier}</td>

                        <td>${item.qty} ${item.satuan}</td>

                        <td>${item.price}</td>

                    `;

                    // Append the row to the table body
                    orderDetailsTableBody.appendChild(row);
                });
            } else {
                // Handle case when no data is returned
                orderDetailsTableBody.innerHTML = "<tr><td colspan='5'>No PO data found for the selected item.</td></tr>";
            }
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Error fetching OC details:', error);
            document.getElementById("orderDetailsTableBody").innerHTML = "<tr><td colspan='5'>Error loading data.</td></tr>";
        });

    // Ensure the modal is visible
    const OCDetailsByNamabarang = document.getElementById('namabarangocModal');
    const myModal = document.getElementById('myModal');

    // Check if the modal elements exist before changing their styles
    if (OCDetailsByNamabarang && myModal) {
        OCDetailsByNamabarang.style.display = 'block';  // Show the details modal
        myModal.style.display = 'none';  // Hide the main modal
    } else {
        console.error("Modal elements not found.");
    }
}

    // Fungsi untuk membuka Order Details Module
function openOrderDetailsModule() {
    const suplierName = document.getElementById("namasuplierDisplay").innerText; // Ambil nama customer
    console.log("Suplier Name:", suplierName);
    
    // Menampilkan nama customer di bawah "Riwayat Order"
    const suplierNameDisplay = document.getElementById("suplierNameDisplay");
    suplierNameDisplay.innerHTML = `${suplierName}`;  // Tampilkan nama customer

    // Memuat data order berdasarkan nama customer
    fetch(`getOrderDetailspo?suplier=${suplierName}`)
        .then(response => response.json())
        .then(data => {
            const orderTableBody = document.querySelector("#orderTable tbody");
            orderTableBody.innerHTML = ""; // Kosongkan tabel sebelum menambahkan data

            if (data.length > 0) {
                console.log("Data Retrieved:", data);
                // Mengambil nama customer dari item pertama (asumsi nama customer sama untuk seluruh data)
                const namasuplier = data[0].namasuplier || 'Nama Customer Tidak Ditemukan';
                console.log("Customer Name from Data:", namasuplier);

                // Menampilkan nama customer dari item
                suplierNameDisplay.innerHTML = `${namasuplier}`;  

                // Menambahkan data ke dalam tabel
                let no = 1;
                data.forEach(item => {
                    const tglpo = item.tglpo;
                    const nopo = item.nopo;
                    const totalall = item.totalall;
                    const namabarangList = item.namabarang.split("<br>");
                    const qtyList = item.qty.split("<br>");
                    const satuanList = item.satuan.split("<br>");

                    // Menambahkan row untuk setiap OC
                    for (let i = 0; i < namabarangList.length; i++) {
                        const row = document.createElement("tr");

                        // Kolom No
                        const noCell = document.createElement("td");
                        noCell.innerText = no++;  
                        row.appendChild(noCell);

                        // Kolom Tgloc
                        const tglpoCell = document.createElement("td");
                        tglpoCell.innerText = tglpo;
                        row.appendChild(tglpoCell);

                        // Kolom OC
                        const nopoCell = document.createElement("td");
                        nopoCell.innerText = nopo;
                        row.appendChild(nopoCell);

                        // Kolom Namabarang
                        const nameCell = document.createElement("td");
                        nameCell.innerHTML = namabarangList[i];  
                        row.appendChild(nameCell);

                        // Kolom Qty
                        const qtyCell = document.createElement("td");
                        qtyCell.innerHTML = qtyList[i];  
                        row.appendChild(qtyCell);

                        // Kolom Satuan
                        const satuanCell = document.createElement("td");
                        satuanCell.innerHTML = satuanList[i];  
                        row.appendChild(satuanCell);

                        // Kolom Grand Total
                        const totalallCell = document.createElement("td");
                        totalallCell.innerText = totalall;
                        row.appendChild(totalallCell);

                        // Menambahkan row ke tabel
                        orderTableBody.appendChild(row);
                    }
                });
            } else {
                console.log("No data found");
                orderTableBody.innerHTML = "<tr><td colspan='7'>Data tidak ditemukan</td></tr>";
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const orderTableBody = document.querySelector("#orderTable tbody");
            orderTableBody.innerHTML = "<tr><td colspan='7'>Terjadi kesalahan dalam memuat data.</td></tr>";
        });

    // Menyembunyikan modal utama dan menampilkan modal detail
    console.log("Opening Order Details Modal...");
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const myModal = document.getElementById('myModal');

    orderDetailsModal.style.display = 'block';  // Menampilkan modal detail
    myModal.style.display = 'none';  // Menutup modal utama
}











// Fungsi untuk kembali ke modul order confirmation
function backToOrderConfirmation() {
    console.log("Going back to Order Confirmation...");
    
    // Menyembunyikan modal detail
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const myModal = document.getElementById('myModal');
    
    orderDetailsModal.style.display = 'none';  // Menutup modal detail
    console.log("orderDetailsModal Display after close:", orderDetailsModal.style.display);
    
    // Menunggu sejenak sebelum menampilkan modal utama
    setTimeout(() => {
        myModal.style.display = 'block';  // Menampilkan modal utama
        console.log("myModal Display after open:", myModal.style.display);
    }, ); // Menunggu 200ms
}

function backToOrderConfirmation1() {
    console.log("Going back to Order Confirmation...");
    
    // Menyembunyikan modal detail
    const namabarangocModal = document.getElementById('namabarangocModal');
    const myModal = document.getElementById('myModal');
    
    namabarangocModal.style.display = 'none';  // Menutup modal detail
    console.log("orderDetailsModal Display after close:", namabarangocModal.style.display);
    
    // Menunggu sejenak sebelum menampilkan modal utama
    setTimeout(() => {
        myModal.style.display = 'block';  // Menampilkan modal utama
        console.log("myModal Display after open:", myModal.style.display);
    }, ); // Menunggu 200ms
}



// Fungsi untuk menutup semua modal
function closeAllModals() {
    console.log("Closing all modals...");
    const myModal = document.getElementById('myModal');

    const    namabarangocModal = document.getElementById('namabarangocModal');

    
    const orderDetailsModal = document.getElementById('orderDetailsModal');

    orderDetailsModal.style.display = 'none';  // Menutup modal detail


    myModal.style.display = 'none';  // Menutup modal utama

    
    namabarangocModal.style.display = 'none';  // Menutup modal detail

}

    document.addEventListener('mousedown', function(event) {
    if (modalOpen && !modal.contains(event.target)) {
        closeModal();
        console.log('Clicked outside modal');
    }
});

function printDocument(nopo) {
    // Misalkan Anda ingin mencetak halaman dengan URL tertentu
    var printUrl = "purchaselocal/print_page.php?nopo=" + nopo;
    
    // Buka jendela baru untuk halaman cetak
    var printWindow = window.open(printUrl, '_blank');
    
    // Tunggu hingga halaman selesai dimuat
    printWindow.onload = function() {
        // Cetak halaman
        printWindow.print();
        
        // Tutup jendela setelah mencetak
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}
