document.addEventListener('DOMContentLoaded', function () {
    const titles = document.querySelectorAll('.protocal-title');

    titles.forEach(titleEl => {
        titleEl.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (!targetContent) return;

            const isOpen = targetContent.classList.contains('open');

            // 先收起所有已展开的按钮与内容
            document.querySelectorAll('.protocal-title.active').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.protocal-content.open').forEach(content => {
                content.classList.remove('open');
            });

            // 如果当前是关闭状态，则展开当前；如果已是展开状态，则保持收起
            if (!isOpen) {
                this.classList.add('active');
                targetContent.classList.add('open');
            }
        });
    });
});