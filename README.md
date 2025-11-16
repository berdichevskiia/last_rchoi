Team Tasks — простое приложение для просмотра задач команды

Как запустить локально:
1. Убедитесь, что установлен Python 3.8+
2. Создайте виртуальное окружение и активируйте его:
   python -m venv .venv
   # Windows: .venv\Scripts\activate
   # macOS/Linux: source .venv/bin/activate
3. Установите зависимости:
   pip install -r requirements.txt
4. Запустите приложение:
   python app.py
5. Откройте в браузере: http://localhost:5000

Описание:
- Backend: Flask + SQLite (создаётся автоматически при первом запуске с демо-данными)
- Frontend: статические HTML/CSS/JS (файлы лежат в templates/ и static/)

API:
- GET /api/tasks
- GET /api/tasks?status=done&assignee=Alex
- POST /api/tasks  {title, description, assignee, priority}
- PUT /api/tasks/<id>  {status, title, ...}
- DELETE /api/tasks/<id>
- GET /api/members
