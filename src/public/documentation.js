document.addEventListener('DOMContentLoaded', (event) => {
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const codeElement = document.getElementById(targetId);
            const codeText = codeElement.innerText;

            navigator.clipboard.writeText(codeText).then(() => {
                button.innerText = 'Copied!';
                setTimeout(() => {
                    button.innerText = 'Copy the code';
                }, 2000);
            }).catch(err => {
                console.error('Error copying', err);
            });
        });
    });
});
