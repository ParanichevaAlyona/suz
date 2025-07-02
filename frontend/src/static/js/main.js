
// TODO: хранить типы задач в localstorage и постоянно в redis и не удалять полностью,
//  чтобы всегда было описание ассистента и человеческое имя для фронта


function loadTasks() {
    fetch(`${BACKEND_URL}/api/v1/tasks`, { credentials: 'include' })
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(tasks => {
            if (!tasks || tasks.length === 0) {  // TODO default state is block, if tasks - something else
                emptyState.style.display = 'block';
                return;
            }

            let lastAddedItem = null;

            tasks.forEach(task => {
                try {
                    task = JSON.parse(task);
                    const taskId = task['task_id'];
                    addTaskToUI(task);

                    lastAddedItem = document.querySelector(`.sidebar-item[data-item-number="${taskId}"]`);
                    //вот эта вся свестопляска для того, чтобы понять подписываться на задачу или нет
                    let statusRawText
                    if (task.status === 'queued') {  // TODO выделить в отдельную функцию
                        let position = task.current_position;
                        if (position > 0) {
                            statusRawText = `ожидание, позиция в очереди: ${position}`
                        } else {
                            statusRawText = 'ожидание, запрос выполняется'
                        }
                    } else if (task.status === 'failed') {
                        statusRawText = 'ошибка';
                    } else if (task.status === 'completed') {
                        statusRawText = 'выполнено';
                    } else if (task.status === 'running') {
                        statusRawText = 'выполняется';
                    } else if (task.status === 'pending') {
                        statusRawText = 'приостановлено, нет запущенных обработчиков для этого типа задачи';
                    }
                    let status = statusRawText
                    updateStatus(taskId, task);

//мне это надо не в сайд бар а ко всем таскам, в сайд баре будут только первые таски в updateStatus короче
//поэтому надо искать не по сайд бару -----куда кстати попадают задачи после updateStatus - помимо сайдбара в tasks в
//result-container
                    //ставим класс в div задаче ------- sidebar должен пойти нафиг
                    const sidebarItem = document.querySelector(`.sidebar-item[data-item-number="${taskId}"]`);
                    if (status === 'выполнено') {
                        sidebarItem.classList.add('completed') // TODO move to updateStatus or separate function
                    } else if (status === 'ошибка') {
                        sidebarItem.classList.add('error')
                    } else {
                        subscribeToTask(taskId);
                    }
                } catch (e) {
                    console.error('Error loading task:', e);
                }
            });

            if (lastAddedItem) {
                is_new_chat = true;

                lastAddedItem.classList.remove('active');
                const taskId = lastAddedItem.dataset.itemNumber;
                const taskEl = document.getElementById(`${taskId}`);
                if (taskEl) {
                    taskEl.classList.remove('active');
                }
            }
        })
        .catch(error => {
            console.error('Network error:', error);
            document.getElementById('emptyState').style.display = 'block';
        });

}

document.addEventListener('DOMContentLoaded', () => {
    // TODO подтягивать в правый сайдбар информацию о хэндлере (схема ответа в backend/schemas/handler)

    fetch(`${BACKEND_URL}/`, {credentials: 'include'})
        .then(response => {
            if (response.ok) {
                console.log('Auth successful');
            } else {
                throw new Error('Auth failed')
            }
        })
        .then(() => {
            loadTasks();
        })
        .catch(error => {
            if (error.message === 'Auth failed') {
                console.error('Auth failed');
                alert('Ошибка авторизации. Пожалуйста, свяжитесь с администратором сервиса.')
            } else {
                console.error('Error:', error);
            }
        });

    document.getElementById('new-chat-btn').addEventListener('click', function() {
    // Очищаем поле ввода
        is_new_chat = true;

        const input = document.getElementById('inputParam');
        input.value = '';
        autoResize(input);

        // Фокусируемся на поле ввода
        input.focus();

        // Снимаем выделение со всех чатов
        document.querySelectorAll('.sidebar-item, .result-container').forEach(el => {
            el.classList.remove('active');
        });

        // Показываем пустое состояние, если нет чатов
        document.getElementById('emptyState').style.display =
            document.querySelectorAll('.sidebar-item').length === 0 ? 'block' : 'none';

        // Скрываем все открытые результаты
        document.querySelectorAll('.result.show').forEach(el => {
            el.classList.remove('show');
        });

        // Обновляем иконки кнопок свернуть/развернуть
        document.querySelectorAll('.toggle-btn .icon').forEach(icon => {
            icon.textContent = '▼';
        });
    });
});
