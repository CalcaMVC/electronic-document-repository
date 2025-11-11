// Aguarda o carregamento completo dos objetos do HTML para executar o script.
document.addEventListener('DOMContentLoaded', function () {

    // Configurações da fonte de texto.
    const FONT_STEP = 0.1;
    const DEFAULT_FONT_SIZE = 1;
    const MIN_FONT_SIZE = 0.5;
    const MAX_FONT_SIZE = 1.5;

    // Seleciona os objetos do HTML.
    const rootElement = document.documentElement;
    const body = document.body;
    const mainContent = document.getElementById('main-content');
    const btnIncreaseFont = document.getElementById('increase-font');
    const btnDecreaseFont = document.getElementById('decrease-font');
    const btnToggleContrast = document.getElementById('toggle-contrast');
    const btnToggleReadingMask = document.getElementById('toggle-reading-mask');
    const btnSpeakText = document.getElementById('speak-text-btn');
    const btnToggleClickMode = document.getElementById('toggle-click-mode-btn');

    let currentFontSize = DEFAULT_FONT_SIZE;
    let maskEnabled = false;
    let clickToSpeakEnabled = false;

    // Cria e adiciona o objeto da máscara de leitura no HTML dinamicamente.
    const readingMask = document.createElement('div');
    readingMask.id = 'reading-mask';
    readingMask.classList.add('hidden');
    body.appendChild(readingMask);

    // Função para aplicar um tamanho de fonte de texto diretamente.
    function applyFontSize(size) {
        rootElement.style.fontSize = size + 'rem';
        
        // Salva a preferência no Local Storage.
        localStorage.setItem('fontSize', size);
        currentFontSize = size;
    }

    // Função para aumentar a fonte de texto.
    function increaseFont() {
        let newSize = currentFontSize + FONT_STEP;

        // Arredonda para evitar problemas com casas decimais.
        newSize = Math.round(newSize * 10) / 10;
        
        if (newSize <= MAX_FONT_SIZE) {
            applyFontSize(newSize);
        }
    }

    // Função para diminuir a fonte de texto.
    function decreaseFont() {
        let newSize = currentFontSize - FONT_STEP;
        newSize = Math.round(newSize * 10) / 10;

        if (newSize >= MIN_FONT_SIZE) {
            applyFontSize(newSize);
        }
    }

    // Função para alternar o alto contraste.
    function toggleContrast() {
        body.classList.toggle('high-contrast');

        // Salva o estado (ligado/desligado) no Local Storage.
        if (body.classList.contains('high-contrast')) {
            localStorage.setItem('highContrast', 'true');
        } else {
            localStorage.setItem('highContrast', 'false');
        }
    }

    // Função para mover a máscara de leitura de acordo com a posição do mouse.
    function moveMask(e) {

        // Centraliza a máscara de leitura na posição Y do mouse.
        readingMask.style.top = (e.clientY - readingMask.offsetHeight / 2) + 'px';
    }

    // Função para ativar/desativar e controlar a máscara de leitura.
    function toggleReadingMask() {
        maskEnabled = !maskEnabled;
        readingMask.classList.toggle('hidden', !maskEnabled);

        // Adiciona ou remove o rastreamento do mouse para otimizar o desempenho.
        if (maskEnabled) {
            window.addEventListener('mousemove', moveMask);
        } else {
            window.removeEventListener('mousemove', moveMask);
        }

        // Salva o estado da máscara de leitura no Local Storage.
        localStorage.setItem('readingMask', maskEnabled);
    }

    // Função para iniciar a leitura de um texto específico.
    function speakText(textToSpeak) {

        // Se a API já estiver falando, interrompe a fala atual.
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        // Cria um objeto de fala com o texto selecionado.
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Define o idioma para garantir a pronúncia correta.
        utterance.lang = 'pt-BR';

        const speakLabel = btnSpeakText.querySelector('.speak-text-label');

        // Evento para quando a fala iniciar.
        utterance.onstart = function() {
            btnSpeakText.classList.add('active');
            speakLabel.textContent = 'Parar';
        };

        // Evento para quando a fala terminar.
        utterance.onend = function() {
            btnSpeakText.classList.remove('active');
            speakLabel.textContent = 'Ouvir';
        };

        // Inicia a leitura do texto.
        speechSynthesis.speak(utterance);
    }

    // Função para ler o texto selecionado pelo usuário em voz alta.
    function speakSelectedText() {

        // Verifica se o navegador do usuário suporta a API de fala.
        if (!('speechSynthesis' in window)) {
            alert("Desculpe, seu navegador não suporta a leitura de texto.");
            return;
        }

        // Pega o texto que o usuário selecionou no HTML.
        const selectedText = window.getSelection().toString().trim();

        if (selectedText.length > 0) {

            // Chama a função central para iniciar a leitura.
            speakText(selectedText);
        } else {

            // Se nada estiver selecionado, o botão funciona apenas para parar.
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            } else {
                alert("Por favor, selecione um trecho de texto para ouvir...");
            }
        }
    }

    // Função para o clique em modo de leitura.
    function handleClickToSpeak(event) {

        // Pega a tag do elemento de HTML que foi clicado.
        const clickedTag = event.target.tagName;
        const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'A'];

        if (validTags.includes(clickedTag)) {

            // Impede a ação padrão de links neste modo.
            event.preventDefault();

            // Chama a função central para ler o conteúdo do elemento de HTML.
            speakText(event.target.textContent);
        }
    }

    // Função para ativar/desativar o modo de leitura por clique.
    function toggleClickToSpeakMode() {
        clickToSpeakEnabled = !clickToSpeakEnabled;
        body.classList.toggle('click-to-speak-active', clickToSpeakEnabled);
        btnToggleClickMode.classList.toggle('active', clickToSpeakEnabled);

        // Adiciona ou remove o ouvinte de evento no container principal.
        if (clickToSpeakEnabled) {
            mainContent.addEventListener('click', handleClickToSpeak);
        } else {
            mainContent.removeEventListener('click', handleClickToSpeak);
        }

        // Salva o estado do modo de leitura por clique no Local Storage.
        localStorage.setItem('clickToSpeak', clickToSpeakEnabled);
    }

    // Função para carregar as preferências do usuário ao abrir o HTML.
    function loadPreferences() {

        // Carrega o tamanho da fonte de texto salvo.
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize !== null) {
            applyFontSize(parseFloat(savedFontSize));
        }

        // Carrega o modo de alto contraste salvo.
        const savedHighContrast = localStorage.getItem('highContrast');
        if (savedHighContrast === 'true') {
            body.classList.add('high-contrast');
        }

        // Carrega o estado da máscara de leitura salvo.
        const savedReadingMask = localStorage.getItem('readingMask');
        if (savedReadingMask === 'true') {
            toggleReadingMask();
        }
        
        // Carrega o estado do modo de leitura por clique salvo.
        const savedClickToSpeak = localStorage.getItem('clickToSpeak');
        if (savedClickToSpeak === 'true') {
            toggleClickToSpeakMode();
        }
    }

    // Adiciona os ouvintes de evento aos botões do HTML.
    btnIncreaseFont.addEventListener('click', increaseFont);
    btnDecreaseFont.addEventListener('click', decreaseFont);
    btnToggleContrast.addEventListener('click', toggleContrast);
    btnToggleReadingMask.addEventListener('click', toggleReadingMask);
    btnSpeakText.addEventListener('click', speakSelectedText);
    btnToggleClickMode.addEventListener('click', toggleClickToSpeakMode);

    // Carrega as preferências do usuário assim que o HTML é carregado.
    loadPreferences();
});