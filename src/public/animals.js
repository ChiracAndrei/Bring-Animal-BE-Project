document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const handleAuthError = async (response) => {
        if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (!newToken) {
                return response;
            }
            response = await fetch(response.url, {
                method: response.config.method,
                headers: {
                    'Authorization': `Bearer ${newToken}`
                },
                body: response.config.body
            });
        }
        return response;
    };

    const refreshAccessToken = async () => {
        const response = await fetch('/api/signin/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: refreshToken })
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login.html';
            return null;
        }

        const data = await response.json();
        localStorage.setItem('token', data.accessToken);
        return data.accessToken;
    };

    document.getElementById('animalForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const animal = document.getElementById('animal').value;
        const random = document.getElementById('random').value;
        const breed = document.getElementById('breed').value;
        const resultDiv = document.getElementById('animalResult');

        try {
            let response = await fetch(`/api/animal/${animal}?random=${random}&breed=${breed}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            response = await handleAuthError(response);

            if (!response.ok) {
                throw new Error('Use random or type the breed');
            }

            const data = await response.json();
            resultDiv.innerHTML = `
                <p>Status: ${data.status}</p>
                <p>Animal: ${data.data.animal}</p>
                <p>Breed: ${data.data.breed}</p>
                <img src="${data.data.exampleImage}" alt="${data.data.breed}" width="300">
                <p>Source: ${data.data.source}</p>
            `;
        } catch (error) {
            resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    document.getElementById('addAnimalForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData();
        let newAnimalType = document.getElementById('newAnimalType').value;
        let newBreed = document.getElementById('newBreed').value
        let newImage = document.getElementById('newImage').files[0]

        formData.append('type', newAnimalType);
        formData.append('breed', newBreed);
        formData.append('image', newImage);

        try {
            let response = await fetch('/api/animal', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            response = await handleAuthError(response);

            if (!response.ok) {
                throw new Error('Failed to add animal');
            }


            document.getElementById('addErrorMessage').textContent = 'Animal added successfully';
            document.getElementById('addAnimalForm').reset();
        } catch (error) {
            document.getElementById('addErrorMessage').textContent = `Error: ${error.message}`;
        }


    });
});
