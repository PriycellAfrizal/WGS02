
  $(document).ready(function() {
    // Inisialisasi Select2 pada elemen dengan ID 'namabarang'
    $('#namabarang').select2({
        width: '370px', // Atur lebar sesuai keinginan
        placeholder: 'Search Items .....', // Teks placeholder
        ajax: {
            // Konfigurasi Ajax untuk mengambil data dari server
            url: 'namabarangunit.php', // Sesuaikan dengan nama skrip PHP Anda
            dataType: 'json',
            delay: 250,
            data: function(params) {
                return {
                    q: params.term, // Parameter pencarian
                    page: params.page
                };
            },
            processResults: function(data, params) {
                return {
                    results: data
                };
            },
            cache: true
        },
        escapeMarkup: function(markup) {
            return markup;
        },
        minimumInputLength: 0 // Jumlah karakter minimal sebelum pencarian dimulai
    });

    // Menangani perubahan pilihan pada Select2
    $('#namabarang').on('select2:select', function(e) {
        // Dapatkan data satuan dari pilihan yang dipilih
        var satuan = e.params.data.satuan;

        // Set nilai satuan pada input dengan ID 'satuan'
        $('#satuan').val(satuan);
    });
});

document.getElementById('namabarang').addEventListener('input', function() {
    var selectedOption = document.querySelector('#namabaranglist option[value="' + this.value + '"]');
    if (selectedOption) {
      var satuanValue = selectedOption.getAttribute('data-satuan');
      document.getElementById('satuan').value = satuanValue;
    }
  });







$(document).ready(function() {
    // Inisialisasi Select2 untuk dropdown "namacustomer"
    $('#namacustomer').select2({
        width: '360px',
        placeholder: 'Search Customer .....',
        ajax: {
            url: 'namacustomer.php',
            dataType: 'json',
            delay: 250,
            data: function(params) {
                return {
                    q: params.term
                };
            },
            processResults: function(data, params) {
                return {
                    results: data
                };
            },
            cache: true
        },
        escapeMarkup: function(markup) {
            return markup;
        },
        minimumInputLength: 0
    }).on('select2:select', function(e) {
        var namacustomer = e.params.data.id; // Ambil ID dari opsi yang dipilih

        // Mengambil data terkait dari nama customer yang dipilih
        $.ajax({
            url: 'namacp.php',
            dataType: 'json',
            data: { namacustomer: namacustomer },
            success: function(data) {
                // Mengisi nilai untuk "CP", "Phone Office", "Customer Email", dan "Customer Address"
                if (data.length > 0) {
                    $('#cp').empty();
                    $('#telp').val(data[0].telp);
                    $('#email').val(data[0].email);
                    $('#alamat').val(data[0].alamat);
                    $('#idcs').val(data[0].id);

                    // Menambahkan data CP ke dropdown CP
                    $.each(data, function(index, item) {
                        $('#cp').append('<option value="' + item.cp + '">' + item.cp + '</option>');
                    });

                    // Mengaktifkan dropdown "CP"
                    $('#cp').prop('disabled', false);

                    // Mengisi nilai untuk nocs dari data yang pertama
                    $('#nocs').val(data[0].no);
                } else {
                    // Menangani kasus jika tidak ada data terkait
                    $('#cp').empty();
                    $('#telp').val('');
                    $('#email').val('');
                    $('#alamat').val('');
                    $('#idcs').val('');
                    $('#nocs').val('');
                }

                // Memperbarui tampilan dropdown CP
                $('#cp').trigger('change');
            }
        });

    }).on('select2:unselect', function(e) {
        // Ketika nilai dropdown "namacustomer" dihapus
        $('#cp').prop('disabled', true); // Menonaktifkan dropdown "CP" kembali
    });

    // Inisialisasi Select2 untuk dropdown "CP"
    $('#cp').select2({
        width: '360px',
        placeholder: 'Search or Add CP .....',
        tags: true, // Mengaktifkan fitur "tags"
        disabled: true // Menonaktifkan dropdown "CP" secara default
    }).on('select2:select', function(e) {
        var cp = e.params.data.id; // Ambil ID dari opsi yang dipilih

        // Mengambil nomor telepon dan no terkait dari cp yang dipilih
        $.ajax({
            url: 'namacp.php',
            dataType: 'json',
            data: { cp: cp },
            success: function(data) {
                $('#nocs').val(data.no); // Mengisi nilai nocs
            }
        });
    });
});
// Format angka menjadi format Rupiah dengan ribuan (.) dan desimal (,)
function formatRupiah(value, addDecimals = false) {
    var numberString = value.toString().replace(/[^,\d]/g, ''); // Hapus karakter non-numerik
    var split = numberString.split(',');
    var rest = split[0].length % 3;
    var rupiah = split[0].substr(0, rest);
    var thousand = split[0].substr(rest).match(/\d{3}/gi);

    if (thousand) {
        var separator = rest ? '.' : '';
        rupiah += separator + thousand.join('.');
    }

    if (addDecimals) {
        if (split[1] !== undefined) {
            rupiah += ',' + split[1].substring(0, 2); // Batasi desimal dua digit
        } else {
            rupiah += ',00'; // Tambahkan ,00 jika tidak ada desimal
        }
    }

    return 'Rp. ' + rupiah;
}

// Update format saat pengguna mengetik
function updateFormattedPrice(inputElement) {
    var inputValue = inputElement.value.replace(/[^,\d]/g, ''); // Hapus karakter non-numerik
    inputElement.value = formatRupiah(inputValue, false); // Format tanpa ,00
}

// Update format saat meninggalkan kolom
function onBlurFormattedPrice(inputElement) {
    var inputValue = inputElement.value.replace(/[^,\d]/g, ''); // Hapus karakter non-numerik
    inputElement.value = formatRupiah(inputValue, true); // Tambahkan ,00 jika tidak ada desimal
}

// Event listener untuk semua input kolom price
document.querySelectorAll('td:nth-child(5) input').forEach(function (input) {
    // Saat mengetik, format angka tanpa ,00
    input.addEventListener('input', function () {
        updateFormattedPrice(input); // Format saat mengetik
    });

    // Saat meninggalkan kolom, tambahkan ,00
    input.addEventListener('blur', function () {
        onBlurFormattedPrice(input); // Tambahkan ,00
    });
});



// Update total price per baris
function updateTotalPrice(inputElement) {
    var row = inputElement.closest('tr');

    // Ambil nilai quantity, unit price, dan discount
    var qty = parseFloat(row.querySelector('td:nth-child(3) input').value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    var price = parseFloat(row.querySelector('td:nth-child(5) input').value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    var discountElement = row.querySelector('td:nth-child(6) input');
    var discount = parseFloat(discountElement.value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

    // Hitung total price
    var totalPrice = qty * price;

    // Validasi discount tidak lebih besar dari totalPrice
    if (discount > totalPrice) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Discount tidak boleh melebihi total harga!',
        });
        discount = 0;
        discountElement.value = formatRupiah(discount.toString()); // Format ulang diskon
    }

    // Kurangi discount dari totalPrice
    totalPrice -= discount;

    // Perbarui nilai total price
    row.querySelector('td:nth-child(7) input').value = formatRupiah(totalPrice.toFixed(2).replace('.', ',')); // Format dengan koma sebagai desimal

    // Format ulang input price dan discount
    row.querySelector('td:nth-child(5) input').value = formatRupiah(price.toString());
    discountElement.value = formatRupiah(discount.toString());

    // Perbarui subtotal
    updateSubtotal();
}

// Hitung subtotal dari semua total price
function updateSubtotal() {
    var totalPriceInputs = document.querySelectorAll('td:nth-child(7) input');
    var subtotal = 0;

    totalPriceInputs.forEach(function (input) {
        var totalPrice = parseFloat(input.value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        subtotal += totalPrice;
    });

    // Perbarui nilai subtotal
    document.getElementById('subtotal').value = formatRupiah(subtotal.toFixed(2).replace('.', ','));

    // Panggil updatePPNAndTotal untuk memperbarui PPN dan totalall
    updatePPNAndTotal();
}

// Perbarui PPN dan totalall setelah memasukkan nilai Persentaseppn
function updatePPNAndTotal() {
    var subtotal = parseFloat(document.getElementById('subtotal').value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    var persentaseInput = document.getElementById('Persentaseppn').value.replace(/[^\d]/g, '');
    var persentase = parseFloat(persentaseInput) / 100 || 0;

    var ppn = subtotal * persentase;
    var totalAll = subtotal + ppn;

    // Perbarui input PPN dan totalall
    document.getElementById('ppn').value = formatRupiah(ppn.toFixed(2).replace('.', ','));
    document.getElementById('totalall').value = formatRupiah(totalAll.toFixed(2).replace('.', ','));
}

// Event listener untuk input dan blur pada kolom price
document.querySelectorAll('td:nth-child(5) input').forEach(function (input) {
    input.addEventListener('input', function () {
        updateFormattedPrice(input); // Format saat mengetik
        updateTotalPrice(input); // Hitung total saat mengetik
    });

    input.addEventListener('blur', function () {
        onBlurFormattedPrice(input); // Tambahkan ,00 jika meninggalkan input
        updateTotalPrice(input); // Hitung total setelah blur
    });
});

// Event listener untuk perubahan Persentaseppn
document.getElementById('Persentaseppn').addEventListener('input', function () {
    updatePPNAndTotal();
});


var counter = 2; // Inisialisasi counter sebagai variabel JavaScript


function initializeSelect2(rowId) {
    // Inisialisasi Select2 untuk elemen 'namabarang' pada baris tersebut
    $(document).ready(function () {
        var namabarangSelect = $('#namabarang-' + rowId);
        namabarangSelect.select2({
            width: '370px', // Atur lebar sesuai keinginan
            placeholder: 'Search Items ....', // Teks placeholder
        });

        // Menangani perubahan pilihan pada Select2
        namabarangSelect.on('select2:select', function (e) {
            // Dapatkan data satuan dari pilihan yang dipilih
            var satuan = e.params.data.satuan;

            // Set nilai satuan pada input dengan ID 'satuan'
            $('#satuan-' + rowId).val(satuan);
        });
    });
}


function initializeSelect2(rowId) {
    $(document).ready(function () {
        var namabarangSelect = $('#namabarang-' + rowId);

        // Initialize Select2 for namabarang
        namabarangSelect.select2({
            width: '370px',
            placeholder: 'Search Items ....',
            ajax: {
                url: 'namabarangunit.php',
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        q: params.term,
                        page: params.page
                    };
                },
                processResults: function (data, params) {
                    return {
                        results: data
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumInputLength: 0
        });

        // Handle the event when a user selects an option
        namabarangSelect.on('select2:select', function (e) {
            // Get the data including satuan from the selected option
            var data = e.params.data;
            
            // Set the corresponding satuan value
            $('#satuan-' + rowId).val(data.satuan);
        });
    });
}


function createQuoteRow(rowId) {
    return `
        <tr>
            <td class="counter">${rowId}</td>
            <td>
                <p>
                    <select style="width:370px;" name="namabarang[]" id="namabarang-${rowId}" class="namabarang" placeholder="" autocomplete="off">
                    </select>
                </p>
            </td>


            <td class="qty-column">
                <p><input style="width: 80px;" type="number" required name="qty[]" min="1" autocomplete="off" value=""
                oninput="updateTotalPrice(this)"></p>
            </td>
            <td class="satuan-column">
                <p><input readonly style="width:120px;" type="text" name="satuan[]" value="" class="satuan" id="satuan-${rowId}"></p>
            </td>
            <td>
                <p><input type="text" required name="price[]" value="" oninput="updateTotalPrice(this)"></p>
            </td>

               <td>
                <p><input type="text" required name="discount[]"  value="" oninput="updateTotalPrice(this)"></p>
            </td>

            <td>
                <p><input type="text" name="totalprice[]" readonly></p>
            </td>

            <td>
                <button type="button" class="btn btn-danger" onclick="deleteRow(this)">Delete</button>
            </td>
        </tr>
    `;
}

function tambahquotes() {
    var table = document.getElementById('table-quotes'); // Dapatkan tbody dari tabel
    var newRow = table.insertRow(); // Tambahkan baris baru ke tabel
    var rowId = counter++;

    // Append the HTML structure for the new row
    newRow.innerHTML = createQuoteRow(rowId);

    // Initialize Select2 for the new row
    initializeSelect2(rowId);
}


  
  document.getElementById('namacustomer').addEventListener('input', function() {
    var selectedOption = document.querySelector('#namacustomerlist option[value="' + this.value + '"]');
    if (selectedOption) {
      var alamatValue = selectedOption.getAttribute('data-alamat');
          var emailValue = selectedOption.getAttribute('data-email');
 
      
      // Set nilai cp dan telp sesuai dengan opsi yang dipilih
      document.getElementById('alamat').value = alamatValue;
      document.getElementById('email').value = emailValue;
    }

  });

  document.getElementById('namacustomer').addEventListener('input', function() {
    var selectedOption = document.querySelector('#namacustomerlist option[value="' + this.value + '"]');
    if (selectedOption) {
      var alamatValue = selectedOption.getAttribute('data-alamat');
          var emailValue = selectedOption.getAttribute('data-email');
 
      
      // Set nilai cp dan telp sesuai dengan opsi yang dipilih
      document.getElementById('alamat').value = alamatValue;
      document.getElementById('email').value = emailValue;
    }
  });

 // Fungsi untuk menghapus baris dari tabel
function deleteRow(button) {
    var row = button.closest('tr'); // Dapatkan baris terdekat dari tombol yang ditekan
    row.remove(); // Hapus baris dari tabel

    // Perbarui subtotal setelah baris dihapus
    updateSubtotal();
}
