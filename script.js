

let totalPrice = 0; // Initialize total price






function addProduct() {
  const barcode = document.getElementById('barcodeInput');
  const qty = document.getElementById('qtyInput');

  // Get the values from the inputs
  const barcodeValue = barcode.value;
  const qtyValue = parseInt(qty.value); // Parse quantity as an integer

  // Retrieve the foundItem from local storage
  const foundItem = retrieveData().find(item => item['Barcode'] === parseInt(barcodeValue));

  // Get the specific fields from the foundItem
  const threshold = foundItem && foundItem['Caixa Fechada'] ? foundItem['Caixa Fechada'] : 0;
  const priceA = foundItem && foundItem['Valor Fechada'] ? foundItem['Valor Fechada'] : 0;
  const priceB = foundItem && foundItem['Valor Fracionada'] ? foundItem['Valor Fracionada'] : 0;

  let finalPrice;

  // Compare entered quantity with threshold and set price accordingly
  if (qtyValue >= threshold) {
    finalPrice = priceA;
  } else {
    finalPrice = priceB;
  }
  
  totalPrice += finalPrice * qtyValue;
  document.getElementById('totalPriceDisplay').textContent = `Valor Total: R$ ${totalPrice.toFixed(2)}`;

  // Create a new product element
  const productDiv = document.createElement('div');
  productDiv.classList.add('product'); // Optional: Add a class for styling purposes

  if (foundItem && foundItem['Codigo'] && foundItem['Descricao']) {
    const productInfo = document.createElement('p');
    productInfo.textContent = `Cód: ${barcodeValue}, Qte: ${qtyValue}, Item: ${foundItem['Codigo']}, Descrição: ${foundItem['Descricao']}\n, Preço: R$ ${finalPrice}`; // Display the calculated price
    productDiv.appendChild(productInfo);
  } else {
    const notFoundInfo = document.createElement('p');
    notFoundInfo.textContent = `Cód: ${barcodeValue}\nQte: ${qtyValue}\nNot found\nPrice: ${finalPrice}`; // Display the calculated price
    productDiv.appendChild(notFoundInfo);
  }

  // Append the new product structure to the productsList
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


















function exportToExcel() {
  const seller = document.getElementById('sellerInput').value;
  const date = document.getElementById('dateInput').value;
  const buyer = document.getElementById('buyerInput').value;

  // Fetch all product elements and extract barcode, quantity, code, description, and price
  const productsDivs = document.querySelectorAll('#productsList div');
  const products = Array.from(productsDivs).map(productDiv => {
    const text = productDiv.textContent;
    const [, barcode, qty, code, description] = text.match(/Cód: (\S+), Qte: (\S+), Item: (\S+), Descrição: (.+)/) || [];

    // Modify this line to extract the price property from the text content
    const price = text.includes('Preço') ? text.split('Preço: ')[1].trim() : 'N/A';

    return { barcode, qty, code, description, price };
  });

  const fileName = prompt("Enter file name", "PEDIDO") || "order_list";

  let dataArray = [
    ["Vendedor", seller],
    ["Data", date],
    ["Comprador", buyer],
    [], // Empty row for spacing
    ["Barcode", "Código", "Quantidade", "Descrição", "Preço"] // Include "Preço" as the header
  ];
  



// Modify the line that formats and pushes the price into the dataArray
products.forEach(product => {
// Format the price without the currency symbol and with commas for decimals
const formattedPrice = parseFloat(product.price.replace('R$ ', '')).toFixed(2);
dataArray.push([product.barcode, product.code, product.qty, product.description, formattedPrice.replace('.', ',')]);});






 // products.forEach(product => {
 // dataArray.push([product.barcode, product.code, product.qty, product.description, product.price]);});







  const worksheet = XLSX.utils.aoa_to_sheet(dataArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'OrderList');
  
  // Save the workbook
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
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

  // Reset the totalPrice variable to zero
  totalPrice = 0;

  // Update the display to show the totalPrice as zero
  document.getElementById('totalPriceDisplay').textContent = `Total: R$ 0.00`;
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
    let displayContent = '<h2>Detalhamento:</h2>';
    for (let key in foundItem) {
      displayContent += `<p>${key}: ${foundItem[key]}</p>`;
    }
    displayDiv.innerHTML = displayContent;
  } else {
    displayDiv.innerHTML = '<p>Código não encontrado.</p>';
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
