function addProduct() {
  const barcode = document.getElementById('barcodeInput');
  const qty = document.getElementById('qtyInput');

  // Get the values from the inputs
  const barcodeValue = barcode.value;
  const qtyValue = qty.value;

  // Retrieve the foundItem from local storage
  const foundItem = retrieveData().find(item => item.Barcode === parseInt(barcodeValue));

  // Create a new product element
  const productDiv = document.createElement('div');
  if (foundItem && foundItem['Codigo'] && foundItem['Descricao']) {
    productDiv.innerHTML = `Cód: ${barcodeValue}, Qte: ${qtyValue}, Item: ${foundItem['Codigo']}, Descrição: ${foundItem['Descricao']}`;
  } else {
    productDiv.innerHTML = `Cód: ${barcodeValue}, Qte: ${qtyValue}, Not found`;
  }

  // Append the new product to the productsList
  document.getElementById('productsList').appendChild(productDiv);

  // Clear the input fields after adding the product
  barcode.value = '';
  qty.value = '';

  // Focus on the barcode input field after adding the product
  barcode.focus();
}




// Listen for Enter key press in the quantity input field
document.getElementById('qtyInput').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    // Trigger addProduct function
    addProduct();
    event.preventDefault();
  }
});

document.getElementById('barcodeInput').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    // Focus on the quantity input field after entering the barcode
    document.getElementById('qtyInput').focus();
  }
});






















function downloadOrderList() {
  const seller = document.getElementById('sellerInput').value;
  const date = document.getElementById('dateInput').value;
  const buyer = document.getElementById('buyerInput').value;

  // Fetch all product elements and extract barcode and quantity
  const productsDivs = document.querySelectorAll('#productsList div');
  const products = Array.from(productsDivs).map(productDiv => {
    const text = productDiv.textContent;
    const [, barcode, qty] = text.match(/Cod: (\S+) Qte: (\S+)/) || [];
    return { barcode, qty };
  });

  const fileName = prompt("Enter file name", "PEDIDO") || "order_list";

  // Create formatted content including seller, date, buyer, barcode, and quantity
  let fileContent = `Vendedor: ${seller}\nData: ${date}\nComprador: ${buyer}\n\nProdutos:\n`;
  products.forEach(product => {
    fileContent += `Cod: ${product.barcode} Qte: ${product.qty}\n`;
  });

  // Create and download the text file
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const a = document.createElement('a');
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = `${fileName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function uploadExcelFile() {
  const input = document.getElementById('excelFileInput');
  const file = input.files[0]; 

  if (file && file.name.endsWith('.xlsx')) { 
    const reader = new FileReader(); 

    reader.onload = function(e) { 
      const data = e.target.result; 
      localStorage.setItem('excelData', data);
      console.log('Excel file stored in localStorage.');
    };

    reader.readAsDataURL(file); 
  } else {
    console.error('Please select an Excel file (.xlsx).');
  }
}

function resetOrderList() {
  document.getElementById('sellerInput').value = '';
  document.getElementById('dateInput').value = '';
  document.getElementById('buyerInput').value = '';
  document.getElementById('productsList').innerHTML = '';
}



// Function to handle Excel file upload
const handleExcelFile = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Access the first sheet in the workbook
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet's data to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Log the retrieved JSON data for debugging
    console.log('Retrieved JSON data:', jsonData);

    // Store jsonData in localStorage
    localStorage.setItem('excelJsonData', JSON.stringify(jsonData));

    // Log a message to indicate successful upload
    console.log('Uploaded JSON file to local storage');
  };

  reader.readAsArrayBuffer(file);
};

// Event listener for Excel file input change
const excelFileInput = document.getElementById('excelFileInput');
excelFileInput.addEventListener('change', handleExcelFile);

// Function to retrieve data from localStorage
// function retrieveData() {
 //  const jsonData = JSON.parse(localStorage.getItem('excelJsonData'));
 //  return jsonData || []; // Return an empty array if no data is found
// }

// Function to retrieve data from localStorage
function retrieveData() {
  const jsonDataString = localStorage.getItem('excelJsonData');
  return jsonDataString ? JSON.parse(jsonDataString) : []; // Parse JSON string to object
}







// Function to display found data on the webpage
function displayData(foundItem) {
  const displayDiv = document.getElementById('displayData');
  if (foundItem) {
    let displayContent = '<h2>Detalhamento dos Produtos:</h2>';
    for (let key in foundItem) {
      displayContent += `<p>${key}: ${foundItem[key]}</p>`;
    }
    displayDiv.innerHTML = displayContent;
  } else {
    displayDiv.innerHTML = '<p>Barcode not found.</p>';
  }
}


// Function to search for barcode within the JSON data
function searchForBarcode(barcode) {
  const jsonDataString = localStorage.getItem('excelJsonData');
  const jsonData = jsonDataString ? JSON.parse(jsonDataString) : [];
  console.log('Retrieved JSON data:', jsonData); // Log retrieved data for debugging

  const foundItem = jsonData.find(item => item.Barcode === parseInt(barcode)); // Ensure barcode is parsed as an integer for comparison

  if (foundItem) {
    console.log('Found item:', foundItem);
    displayData(foundItem); // Display found data on the webpage
  } else {
    console.log('Barcode not found.');
    displayData(null); // Display "Barcode not found" on the webpage
  }
}

// Event listener for barcode input to trigger search on Enter key press
document.getElementById('barcodeInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    const barcode = e.target.value;
    searchForBarcode(barcode);
  }
});
