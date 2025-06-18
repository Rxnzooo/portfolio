document.addEventListener("DOMContentLoaded", function () { 
    const languageToggle = document.getElementById("language-toggle"); // Knop om taal te wisselen
    let currentLang = "nl"; // Start in Nederlands

    function switchLanguage() { // Functie om taal te wisselen 
        if (currentLang === "nl") { // Als taal Nederlands is 
            fetch("translations.json") // Vertalingen inladen
                .then(response => response.json()) // JSON bestand inladen
                .then(translations => {  // Vertalingen inladen
                    document.querySelectorAll("[data-key]").forEach(element => { // Voor elk element met data-key 
                        const key = element.getAttribute("data-key");
                        if (translations[key]) { // Als vertaling bestaat
                            element.innerText = translations[key]; // Verander tekst naar vertaling
                        }
                    });
                    currentLang = "en"; // Verander taal naar Engels
                    languageToggle.innerText = "NE/EN"; // Verander knop tekst
                })
                .catch(error => console.error("Fout bij laden van vertalingen:", error)); // Foutmelding bij laden vertalingen
        } else {
            document.location.reload(); // Vernieuwt pagina om terug naar NL te gaan
        }
    }

    languageToggle.addEventListener("click", switchLanguage); // Wissel taal bij klik op knop

    // Dynamisch jaar instellen voor copyright
    const currentYear = new Date().getFullYear();
    document.querySelector(".footer-copyright p").innerText = `© ${currentYear} Renzo Siebeling. All rights reserved.`; 
});

document.getElementById("contact-form").addEventListener("submit", async function(event) {
    event.preventDefault();  // Voorkomt dat de pagina vernieuwt

    const name = document.getElementById("naam").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("aanvraag").value; 
    
    
    let statusMessage = document.getElementById("form-status");
    if (!statusMessage) {
        statusMessage = document.createElement("p"); 
        statusMessage.id = "form-status"; // Maak een nieuw element voor statusbericht  
        document.getElementById("contact-form").appendChild(statusMessage); // Voeg statusbericht toe aan formulier
    }

    // Verstuur de gegevens naar de server
    const response = await fetch("http://localhost:3000/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
    });

    const result = await response.json();

    // Als succes, geef een succesbericht weer en maak het formulier leeg
    if (result.success) {
        statusMessage.innerText = "Uw bericht is succesvol verzonden!";
        statusMessage.style.color = "green"; // Groene tekst voor succes
        document.getElementById("contact-form").reset(); // Maak het formulier leeg
    } else {
        // Als er een fout is, geef een foutmelding weer
        statusMessage.innerText = "Er is iets fout gegaan, probeer het opnieuw.";
        statusMessage.style.color = "red"; // Rode tekst voor fout
    }
});

// De functie om projecten op te halen en te tonen
function loadProjects(category) {
    fetch(`/api/projects?category=${category}`)
        .then(response => response.json())
        .then(projects => {
            const projectsContainer = document.querySelector('.projects-container');
            projectsContainer.innerHTML = ''; // Leeg de container voordat je nieuwe projecten toont

            projects.forEach(project => {
                const projectElement = document.createElement('div');
                projectElement.classList.add('project');
                
                projectElement.innerHTML = `
                    <img src="${project.image_url}" alt="${project.name}"> // Toon de afbeelding van het project
                    <h2>${project.name}</h2> // Toon de naam van het project
                `;

                projectsContainer.appendChild(projectElement);
            });
        })
        .catch(error => console.error('Er is een fout opgetreden:', error));
}

const filterDropdown = document.querySelector('#project-filter');
filterDropdown.addEventListener('change', () => {
    const selectedCategory = filterDropdown.value;
    loadProjects(selectedCategory);
});

        const projectGrid = document.querySelector('.project-grid');
        const filter = document.getElementById('project-filter');
    
        // Functie om projecten te laden
        const loadProjects = (category = '') => {
            let url = 'http://localhost:3002/api/projects';
            if (category) {
                url += `?category=${category}`;
            }
    
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    projectGrid.innerHTML = ''; // Maak het rooster leeg
                    data.forEach(project => {
                        const projectDiv = document.createElement('div');
                        projectDiv.classList.add('project');
                        projectDiv.innerHTML = `
                            <a href="project.html?id=${project.id}" data-key="project-${project.id}">
                                <img src="${project.image_url}" alt="${project.name}" data-key="project-${project.id}-img">
                                <h2 data-key="project-${project.id}-title">${project.name}</h2>
                            </a>
                        `;
                        projectGrid.appendChild(projectDiv);
                    });
                })
                .catch(error => console.error("Fout bij het ophalen van projecten:", error));
        };
    
        // Laad standaard alle projecten
        loadProjects();
    
        // Filter projecten wanneer de gebruiker een optie kiest
        filter.addEventListener('change', (e) => {
            loadProjects(e.target.value);
        });
