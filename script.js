let version = "7.1";
const parser = new DOMParser();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const progressParagraph = document.getElementById('progress');
progressParagraph.style.display = 'block';

document.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const mainName = document.getElementById("mainName").value;
    const puppetList = document.getElementById("puppetList").value;
    const containers = document.getElementById("containers").checked;
    const puppets = puppetList.split('\n');
    const userAgent = `${mainName} Gotissues Written by 9003, Email NSWA9002@gmail.com,discord: 9003, NSNation 9003`
    const issueIdsList = []
    let containerise_nation = ''
    let containerise_container = ''
    for (let i = 0; i < puppets.length; i++) {
        const progress = document.createElement("p")
        try {
            await sleep(700);
            if (!puppets[i].includes(',')) throw new Error("FORMAT IT RIGHT PLEASE!")
            const nation = puppets[i].split(',')
            progress.textContent = `Processing ${nation[0]}, ${i+1}/${puppets.length}`
            if (containers) {
              containerise_nation += `@^.*\\.nationstates\\.net/(.*/)?nation=${nation[0].toLowerCase().replaceAll(' ', '_')}(/.*)?$ , ${nation[0]}\n`
              containerise_container += `@^.*\\.nationstates\\.net/(.*/)?container=${nation[0].toLowerCase().replaceAll(' ', '_')}(/.*)?$ , ${nation[0]}\n`
            }
            progressParagraph.prepend(progress)
            const response = await fetch(
                "https://www.nationstates.net/cgi-bin/api.cgi/?nation=" +
                nation[0] +
                "&q=issues+packs",
                {
                    method: "GET",
                    headers: {
                        "User-Agent": userAgent,
                        "X-Password": nation[1].replace(" ", "_"),
                    },
                }
            );
            const xml = await response.text()
            const xmlDocument = parser.parseFromString(xml, 'text/xml');
            const issueIds = xmlDocument.querySelectorAll('ISSUE');
            const packs = xmlDocument.querySelector('PACKS');
            const nationObj = {
                nation: nation[0].toLowerCase().replaceAll(' ', '_'),
                issues: [],
                packs: packs ? parseInt(packs.textContent) : 0
            }
            issueIds.forEach(issue => {
                nationObj.issues.push(issue.getAttribute('id'))
            });
            issueIdsList.push(nationObj)
        } catch (err) {
            progress.textContent = `Error processing ${nation[0]} with ${err}` 
        }
    }

    // Function to open the next link in a new tab
    function openNextLink() {
        if (currentIndex < issueIdsList.length) {
            const puppet = issueIdsList[currentIndex];
            const issueIndex = currentIndex;
            currentIndex++;
    
            // Construct the URL to the issue
            const issueUrl = `https://www.nationstates.net/container=${puppet.nation}/nation=${puppet.nation}/page=show_dilemma/dilemma=${puppet.issues[issueIndex]}/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/`;
    
            // Open the URL in a new tab
            window.open(issueUrl, '_blank');
    
            // Check if there are more links to open
            if (currentIndex < issueIdsList.length) {
                // Enable the button for opening the next link
                document.getElementById('openNextButton').disabled = false;
            } else {
                // Disable the button when all links are opened
                document.getElementById('openNextButton').disabled = true;
            }
        }
    }

    // Add an event listener for the "Open Next Link" button
    document.getElementById('openNextButton').addEventListener('click', openNextLink);

    // Initial button state (disable if no links to open)
    if (issueIdsList.length === 0) {
        document.getElementById('openNextButton').disabled = true;
    } else {
        document.getElementById('openNextButton').disabled = false;
    }

    const progress = document.createElement("p")
    progress.textContent = `Finished processing`
    progressParagraph.prepend(progress)

    if (containers) {
        const blob = new Blob([containerise_container], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "Containerise (container).txt";
        link.click();
  
        const blob2 = new Blob([containerise_nation], { type: 'text/plain' });
        const url2 = window.URL.createObjectURL(blob2);
        const link2 = document.createElement('a');
        link2.href = url2;
        link2.download = "Containerise (nation).txt";
        link2.click();
  
        window.URL.revokeObjectURL(url);
        window.URL.revokeObjectURL(url2);
    }
});
