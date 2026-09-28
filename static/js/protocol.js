document.addEventListener('DOMContentLoaded', function () {
    const titles = document.querySelectorAll('.protocal-title');
    titles.forEach(titleEl => {
        titleEl.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (!targetContent) return;
            const isOpen = targetContent.classList.contains('open');

            // 获取当前按钮所属的一级章节分组容器
            const groupWrap = this.closest('.protocal-group');
            if(groupWrap){
                // ✅ 仅关闭【同一组】内的active按钮和open内容，不同组不受影响
                groupWrap.querySelectorAll('.protocal-title.active').forEach(btn => {
                    btn.classList.remove('active');
                });
                groupWrap.querySelectorAll('.protocal-content.open').forEach(content => {
                    content.classList.remove('open');
                });
            }

            // 如果当前关闭，则展开；再次点击已展开保持关闭
            if (!isOpen) {
                this.classList.add('active');
                targetContent.classList.add('open');
            }
        });
    });
});
