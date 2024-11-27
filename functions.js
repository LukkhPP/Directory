let locationxyz, samename, style, Pinloc, Pinloc2;

document.addEventListener('DOMContentLoaded', function () {
    const leftPanellMap = document.getElementById('leftPanelMap');
    const leftPanellUser = document.getElementById('leftPanelUser');
    const Dept = document.getElementById('Search-Dept');
    const User = document.getElementById('Search-User');
    const xclose = document.getElementById('x_bttn');
    const xclose2 = document.getElementById('x_bttnuser');
    // front panel
    const xclose3 = document.getElementById('bttn-X');
    const frontPAN = document.getElementById('front_panel');
    const locatePin = document.getElementById('pictop');
    const modall = document.getElementById('modall');
    // front panel office name

    Dept.addEventListener('click', () => {
        leftPanellMap.classList.toggle('open');
        leftPanellUser.classList.remove('open');
        frontPAN.classList.remove('open');
    });

    xclose.addEventListener('click', () => {
        leftPanellMap.classList.remove('open');
        
    });

    User.addEventListener('click', () => {
        leftPanellUser.classList.toggle('open');
        leftPanellMap.classList.remove('open');
        frontPAN.classList.remove('open');
    });

    xclose2.addEventListener('click', () => {
        leftPanellUser.classList.remove('open');
    });

    locatePin.addEventListener('click', () => {
        frontPAN.classList.toggle('open');
        leftPanellUser.classList.remove('open');
        leftPanellMap.classList.remove('open');
    });

    xclose3.addEventListener('click', function () {
        frontPAN.classList.toggle('open');
    });

    // For Office Search Tab
    const input = document.getElementById('Department_Search');
    const resultsContainer = document.getElementById('Department_results');
    let namesWithInfo = [];

    // Fetch the data from the text file
    fetch('./public/dept-off.csv')
        .then(response => response.text())
        .then(data => {
            // Split the file by newline and separate names, info, and image source
            namesWithInfo = data.split('\n').map(line => {
                const [name, info, imgsrclnk, PinXYZ] = line.split('|').map(item => item.trim());
                return { name, info, imgsrclnk, PinXYZ };
            });
        })
        .catch(error => console.error('Error fetching names:', error));

    // Handle the input search
    input.addEventListener('input', function () {
        const query = input.value.toLowerCase();
        resultsContainer.innerHTML = ''; // Clear previous results

        if (query === '') {
            // Show default contents if the search box is empty
            const contents = document.createElement('div');
            const imd = document.createElement('i');
            const mapcon = document.createElement('i');
            const Stext = document.createElement('i');

            contents.id = 'contents';
            imd.className = 'i10';
            imd.textContent = 'Interactive Mapping Directory';
            mapcon.id = 'i20';
            mapcon.className = 'fa-solid fa-map-location-dot';
            Stext.className = 'i30';
            Stext.textContent = 'Find an Office or Department!';

            contents.appendChild(imd);
            contents.appendChild(mapcon);
            contents.appendChild(Stext);
            resultsContainer.appendChild(contents);
            Pinloc.classList.remove('pulse-grow');
            Pinloc2.classList.remove('pulse-grow');
            return;
        }

        // Filter the names based on the query
        const filteredNames = namesWithInfo.filter(person => person.name.toLowerCase().includes(query));

        // Display the filtered names
        filteredNames.forEach(person => {
            const div = document.createElement('div');
            const icon = document.createElement('i');
            const textINF = document.createElement('i');
            const imge = document.getElementById('photoDepM');
            const NameOD = document.getElementById('NameofOD');
            // Set the icon class
            icon.className = 'fa-solid fa-building';
            icon.id = 'Icon-Building';
            textINF.id = 'textINF';
            div.classList.add('result');

            // Append the icon first, then the name text
            
            div.appendChild(icon);
            textINF.appendChild(document.createTextNode(' ' + person.name));
            div.appendChild(textINF);
            
            resultsContainer.appendChild(div);
            Pinloc = document.getElementById('picto_loc');
            Pinloc2 = document.getElementById('pictop');

            //Animation

            style = document.createElement('style');
            style.textContent = `
            @keyframes pulseGrow {
                0% {
                    transform: scale(1); /* Original size */
                    color: rgb(255, 0, 0);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.6); /* Scale up */
                    color: rgb(36, 26, 122);
                    opacity: 0.5;
                }
                100% {
                    transform: scale(1); /* Return to original size */
                    color: rgb(255, 0, 0);
                    opacity: 1;
                }
            }
            
            .pulse-grow {
                animation: pulseGrow 0.7s ease-in-out; /* Animation duration and easing */
            }
            
             @keyframes pulseGrow2 {
                0% {
                     /* Original size */
                    color: rgb(255, 0, 0);
                }
                50% {
                     /* Scale up */
                    color: rgb(36, 26, 122);
                }
                100% {
                     /* Return to original size */
                    color: rgb(255, 0, 0);
                }
            }
            
            .pulse-grow2 {
                animation: pulseGrow2 0.7s ease-in-out; /* Animation duration and easing */
            }
            `;
            document.head.appendChild(style);

            // Add click event to display the info and image in the modal


            div.addEventListener('click', function () {
                const defaultimg = './public/Photo/Default_Photo.png'
                if (person.imgsrclnk){
                    imge.src = person.imgsrclnk;
                    
                }else {imge.src = defaultimg;}

                if (div.classList.contains('pulse-grow')){
                    Pinloc.classList.remove('pulse-grow');
                    Pinloc2.classList.remove('pulse-grow2');

                    setTimeout(() => {
                        Pinloc.classList.add('pulse-grow');
                        Pinloc2.classList.add('pulse-grow2');
                    }, 1000);
                } else {Pinloc.classList.add('pulse-grow');
                        Pinloc2.classList.add('pulse-grow2');

                    setTimeout(() => {
                        Pinloc.classList.remove('pulse-grow');
                        Pinloc2.classList.remove('pulse-grow2');
                    }, 1000);
                }

                locationxyz = person.PinXYZ;
                samename = person.name;
                NameOD.textContent = person.name;
            });
            
        });

        // Handle no results case
        if (filteredNames.length === 0 && query) {
            const noResults = document.createElement('div');
            noResults.classList.add('result');
            noResults.textContent = 'No matches found.';
            resultsContainer.appendChild(noResults);
        }
    });
});

export { locationxyz, samename };

// Prevent zooming with Ctrl/Command +/-, and Ctrl/Command + Mouse Wheel
document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=' || event.key === '-' || event.key === '0')) {
        event.preventDefault();
    }
});
