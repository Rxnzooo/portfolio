document.addEventListener("DOMContentLoaded", function () { 
    const languageToggle = document.getElementById("language-toggle");
    let currentLang = localStorage.getItem("lang") || "nl"; // Haal gekozen taal op uit localStorage

    function applyTranslations(lang) {
        fetch("translations.json")
            .then(response => response.json())
            .then(translations => {
                document.querySelectorAll("[data-key]").forEach(element => {
                    const key = element.getAttribute("data-key");
                    if (translations[key]) {
                        element.innerText = translations[key];
                    }
                });
                currentLang = lang;
                localStorage.setItem("lang", lang); // Sla gekozen taal op
                languageToggle.innerText = lang === "en" ? "NE/EN" : "EN/NE";
            })
            .catch(error => console.error("Fout bij laden van vertalingen:", error));
    }

    function switchLanguage() {
        if (currentLang === "nl") {
            applyTranslations("en");
        } else {
            localStorage.setItem("lang", "nl"); // Zet terug naar NL
            document.location.reload(); // Laad opnieuw om standaard NL te tonen
        }
    }

    languageToggle.addEventListener("click", switchLanguage);

    // Als opgeslagen taal Engels is, pas direct toe bij laden
    if (currentLang === "en") {
        applyTranslations("en");
    }
});

    // Dynamisch jaar instellen voor copyright
    const currentYear = new Date().getFullYear();
    document.querySelector(".footer-copyright p").innerText = `© ${currentYear} Renzo Siebeling. All rights reserved.`; 

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