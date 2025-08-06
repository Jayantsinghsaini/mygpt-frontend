const sup = document.querySelector('#super');

const observer = new MutationObserver(() => {
    const array1 = sup.querySelectorAll('#request');
    const array2 = sup.querySelectorAll('#response');
    if (array1.length !== 0 || array2.length !== 0) {
        const greeting = document.querySelector('.greeting');
        greeting.style.display = 'none';
    }
});

observer.observe(sup, {
    childList: true,
    subtree: true
});

setTimeout(() => {
    const container = document.getElementById('reload');
    container.classList.add('hide');
    container.addEventListener('transitionend', () => {
        container.style.display = 'none';
    });
}, 100);

const textarea = document.querySelector("textarea");

textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
});

const md = window.markdownit({
    highlight: function (str, lang) {
        const grammar = Prism.languages[lang] || Prism.languages.markup;
        const highlighted = Prism.highlight(str, grammar, lang);
        return `<pre  class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
    }
});

fetch('https://mygpt-backend-c8k4.onrender.com/retrieve-conversation')
    .then(response => {
        if (!response.ok) throw Error('Request failed');
        return response.json();
    })
    .then(data => {
        for (let index = 0; index < data.length; index++) {
            const Super = document.getElementById('super');

            const preRequest = document.createElement('div');
            preRequest.id = 'request';
            preRequest.textContent = data[index].request;
            Super.appendChild(preRequest);

            const preResponse = document.createElement('div');
            preResponse.id = 'response';
            const html = md.render(data[index].response);
            preResponse.innerHTML = html;

            Prism.highlightAll();
            Super.appendChild(preResponse);
        }

    })
    .catch(error => console.error(error))

fetch('https://mygpt-backend-c8k4.onrender.com/retrieve-chats')
    .then(response => response.json())
    .then(data => {
        const container = document.querySelector('.chats-container');
        for (let i = 0; i < data.length; i++) {
            const chat = document.createElement('div');
            chat.className = 'chat';
            chat.onclick = () => selectChat(data[i].collection);
            chat.innerHTML = `<span class="chat-text">${data[i].name}</span><img class="delete-icon" src="assets/svg/delete.svg" onclick="deleteChat(event, '${data[i].collection}')" alt="">`;
            container.appendChild(chat);
        }
    });

function selectChat(collectionName) {
    fetch('https://mygpt-backend-c8k4.onrender.com/select-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: collectionName
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
        })
        .catch(error => console.error(error));

    setTimeout(() => {
        location.reload();
    }, 500);
}

function deleteChat(event, collectionName) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
        fetch('https://mygpt-backend-c8k4.onrender.com/delete-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: collectionName
        })
            .then(response => {
                if (!response.ok) throw new Error('Request failed');
            })
            .catch(error => console.error(error));
            
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.chat-menu');
    sidebar.classList.toggle('open');

    if (window.matchMedia("(min-width: 1280px)").matches) {
        const resBasePlate = document.querySelector('.base-plate');
        const resContainer = document.querySelector('.container');
        const resGreeting = document.querySelector('.greeting');
        const resSuper = document.getElementById('super');

        resBasePlate.classList.toggle('res-container');
        resContainer.classList.toggle('res-container');
        resGreeting.classList.toggle('res-container');
        resSuper.classList.toggle('res-super');
    }
}

async function newChat() {
    try {
        await fetch('https://mygpt-backend-c8k4.onrender.com/new-collection');
        location.reload();
    }
    catch (error) {
        console.error(error)
    }
}

function input() {
    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    }, 100);

    const input = document.getElementById('input');
    const Super = document.getElementById('super');

    if (!input.value.trim()) return;

    const preRequest = document.createElement('div');
    preRequest.id = 'request';
    preRequest.textContent = input.value;
    Super.appendChild(preRequest);


    const preResponse = document.createElement('div');
    preResponse.id = 'response';
    preResponse.innerHTML = '<div id="circle"></div>';
    preResponse.style.backgroundColor = '#212121'
    Super.appendChild(preResponse);

    fetch('https://mygpt-backend-c8k4.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: input.value,
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.text();
        })
        .then(data => {
            let html = md.render(data);
            // preResponse.innerHTML = html; 

            const fullText = html;
            let i = 0;
            const typing = setInterval(() => {
                i++;
                preResponse.innerHTML = fullText.slice(0, i);

                if (i >= fullText.length) {
                    clearInterval(typing);
                }
            }, 0);

            preResponse.style.backgroundColor = '#333333'
            Prism.highlightAll();
        })
        .catch(err => console.error(err));
    textarea.style.height = "auto";
    input.value = '';
}

textarea.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        input()
    }
});

