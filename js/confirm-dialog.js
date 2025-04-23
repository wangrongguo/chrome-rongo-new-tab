// 显示确认取消弹窗的函数
function showConfirmDialog(message, confirmCallback, cancelCallback) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'confirm-dialog-overlay';

    // 创建弹窗容器
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';

    // 创建消息文本
    const messageElement = document.createElement('p');
    messageElement.className = 'confirm-dialog-message';
    messageElement.textContent = message;

    // 创建确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm-dialog-button confirm-dialog-confirm';
    confirmButton.textContent = '确认';
    confirmButton.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        // 关闭弹窗
        document.body.removeChild(overlay);
    });

    // 创建取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.className = 'confirm-dialog-button confirm-dialog-cancel';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', () => {
        if (cancelCallback) {
            cancelCallback();
        }
        // 关闭弹窗
        document.body.removeChild(overlay);
    });

    // 将元素添加到弹窗容器
    dialog.appendChild(messageElement);
    dialog.appendChild(confirmButton);
    dialog.appendChild(cancelButton);

    // 将弹窗容器添加到遮罩层
    overlay.appendChild(dialog);

    // 将遮罩层添加到页面
    document.body.appendChild(overlay);
}

// 示例调用
// showConfirmDialog('您确定要执行此操作吗？', 
//     () => { console.log('用户点击了确认'); }, 
//     () => { console.log('用户点击了取消'); }
// );