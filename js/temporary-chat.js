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
    textarea.style.height = "auto"; // reset
    textarea.style.height = textarea.scrollHeight + "px"; // adjust
});

const md = window.markdownit({
    highlight: function (str, lang) {
        const grammar = Prism.languages[lang] || Prism.languages.markup;
        const highlighted = Prism.highlight(str, grammar, lang);
        return `<pre  class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
    }
}); 

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
     
    fetch('http://localhost:3000/temp-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: input.value,
    })
    .then(response => {
        if (!response.ok) throw Error('Request failed');
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
