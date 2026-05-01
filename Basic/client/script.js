// fetch data from localhost:3000/api/data and add it in data-container div
fetch('http://localhost:3000/')
    .then(response => response.text())
    .then(data => {
        const dataContainer = document.getElementById('data-container');
        dataContainer.textContent = data;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });