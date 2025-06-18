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

        document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    const emailInput = document.getElementById("email");
    const naamInput = document.getElementById("naam");
    const aanvraagInput = document.getElementById("aanvraag");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Voorkomt standaard verzending

        const allowedDomains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "icloud.com"];
        const emailValue = emailInput.value.trim().toLowerCase();
        const emailDomain = emailValue.split("@").pop(); // Haal domein uit e-mailadres

        let errors = [];

        //  Strikte e-mailvalidatie
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailValue)) { 
            errors.push("Ongeldig e-mailadres."); 
        }

        //  Beperk e-maildomeinen
        if (!allowedDomains.includes(emailDomain)) {
            errors.push("Gebruik een e-mailadres van een bekend domein zoals Gmail, Hotmail, Yahoo, Outlook of iCloud.");
        }

        //  Bescherming tegen XSS (gevaarlijke tekens)
        const dangerousCharacters = /[<>]/;
        if (dangerousCharacters.test(naamInput.value) || dangerousCharacters.test(aanvraagInput.value)) {
            errors.push("Gebruik geen gevaarlijke tekens zoals < of >.");
        }

        //  Minimale en maximale lengte controles
        if (naamInput.value.length < 3 || naamInput.value.length > 100) {
            errors.push("Uw naam moet tussen 3 en 100 tekens bevatten.");
        }
        if (aanvraagInput.value.length < 10 || aanvraagInput.value.length > 500) {
            errors.push("Uw bericht moet tussen 10 en 500 tekens bevatten.");
        }

        //  Spamfilter: Controleer of de gebruiker geen te snelle input geeft
        if (aanvraagInput.value.split(" ").length < 3) {
            errors.push("Uw bericht moet ten minste 3 woorden bevatten.");
        }

        //  Check of het formulier al eerder is ingediend
        if (form.dataset.submitted) {
            errors.push("U heeft dit formulier al ingediend.");
        }

        //  Als er fouten zijn, toon ze en stop verzending
        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        //  Markeer het formulier als ingediend om dubbele inzendingen te voorkomen
        form.dataset.submitted = "true";

        //  Debugging (zie de console of het formulier correct wordt verzonden)
        console.log("Formulier is correct en wordt verzonden.");
        form.submit();
    });
});