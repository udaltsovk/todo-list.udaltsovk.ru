
const tasks = new Map()

function loadTasks() {
  const tasksJson = localStorage.getItem("tasks")
  if (!tasksJson) {
    return new Map()
  }

  const tasksObject = JSON.parse(tasksJson)
  const tasksEntries = Object.entries(tasksObject)

  return new Map(tasksEntries)
}

function saveTasks() {
  const tasksObject = Object.fromEntries(tasks)
  const tasksJson = JSON.stringify(tasksObject)

  localStorage.setItem("tasks", tasksJson)
}

const taskCreateForm = document.querySelector(".task-create-form")
const taskTitleInput = taskCreateForm.querySelector("#task-create-form__title")
const taskBodyInput = taskCreateForm.querySelector("#task-create-form__body")
const createTaskButton = taskCreateForm.querySelector("#task-create-form__submit")

function updateTaskButton(taskTitle, taskBody) {
  const isFilled = taskTitle && taskBody

  if (isFilled && createTaskButton.disabled) {
    createTaskButton.disabled = false
  } else if (!isFilled && !createTaskButton.disabled) {
    createTaskButton.disabled = true
  }
}

taskTitleInput.addEventListener("input", (event) => {
  event.preventDefault()

  updateTaskButton(event.target.value, taskBodyInput.value)
})
taskBodyInput.addEventListener("input", (event) => {
  event.preventDefault()

  updateTaskButton(taskTitleInput.value, event.target.value)
})

function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match) => (map[match]));
}

const tasksContainer = document.querySelector(".tasks")

function createTask(id, title, body, isCompleted = false) {
  let task = document.createElement("li")
  task.className = "task"
  task.id = `task__${id}`
  task.innerHTML = `
    <button class="task__title">
      <h4>${sanitize(title)}</h4>
    </button>
    <button class="task__body">${sanitize(body)}</button>
    <form action="" class="task__edit-form hidden">
      <textarea id="task__edit-form__body" class="task__edit-form__input"></textarea>
      <div class="task__edit-form__controls">
        <input type="submit" class="submit-button" id="task__edit-form__controls__submit" value="Save">
        <input type="reset" id="task__edit-form__controls__cancel" value="Cancel">
      </div>
    </form>
    `.trim()

  if (isCompleted) {
    task.classList.add("done")
  }

  tasksContainer.appendChild(task)

  const ret = {
    title,
    body,
    isCompleted,
  }

  if (isCompleted) {
    return ret
  }

  const taskBody = task.querySelector(".task__body")

  const editTask = (event) => {
    event.preventDefault()

    taskTitle.disabled = true
    taskTitle.removeEventListener("dblclick", markAsCompleted)
    taskBody.removeEventListener("dblclick", editTask)

    const taskEditForm = task.querySelector(".task__edit-form")

    const taskBodyEdit = taskEditForm.querySelector("#task__edit-form__body")

    const saveTaskButton = taskEditForm.querySelector("#task__edit-form__controls__submit")

    const saveTask = (event) => {
      event.preventDefault()

      const newBody = taskBodyEdit.value

      taskBody.innerText = sanitize(newBody)

      tasks.set(id, {
        ...tasks.get(id),
        body: newBody
      })
      saveTasks()

      closeForm()
    }

    const updateSaveButton = (event) => {
      event.preventDefault()


      const isFilled = event.target.value

      if (isFilled && saveTaskButton.disabled) {
        saveTaskButton.disabled = false
      } else if (!isFilled && !saveTaskButton.disabled) {
        saveTaskButton.disabled = true
      }
    }

    taskBodyEdit.addEventListener("input", updateSaveButton)

    saveTaskButton.addEventListener("click", saveTask)

    const cancelButton = taskEditForm.querySelector("#task__edit-form__controls__cancel")

    const cancelEditing = (event) => {
      event.preventDefault()

      closeForm()
    }

    cancelButton.addEventListener("click", cancelEditing)

    const closeForm = () => {
      taskBodyEdit.removeEventListener("input", updateSaveButton)
      saveTaskButton.removeEventListener("click", saveTask)
      cancelButton.removeEventListener("click", cancelEditing)

      taskBody.addEventListener("dblclick", editTask)
      taskTitle.addEventListener("dblclick", markAsCompleted)
      taskTitle.disabled = false

      taskEditForm.classList.add("hidden")
      taskBody.classList.remove("hidden")
    }

    taskBodyEdit.value = taskBody.innerText

    taskBody.classList.add("hidden")
    taskEditForm.classList.remove("hidden")
  }

  taskBody.addEventListener("dblclick", editTask)

  const taskTitle = task.querySelector(".task__title")

  const markAsCompleted = (event) => {
    event.preventDefault()

    tasks.set(id, {
      ...tasks.get(id),
      isCompleted: true
    })
    saveTasks()

    task.classList.add("done")
    taskTitle.removeEventListener("dblclick", markAsCompleted)
    taskBody.removeEventListener("dblclick", editTask)
  }

  taskTitle.addEventListener("dblclick", markAsCompleted)

  return ret
}

createTaskButton.addEventListener("click", (event) => {
  event.preventDefault()

  let task = createTask(
    tasks.length,
    taskTitleInput.value,
    taskBodyInput.value
  )

  taskCreateForm.reset()

  tasks.set(tasks.size.toString(), task)
  saveTasks()
})

loadTasks().forEach((task, id) => {
  if (tasks.has(id)) {
    return
  }

  createTask(id, task.title, task.body, task.isCompleted)
  tasks.set(id, task)
})

updateTaskButton(taskTitleInput.value, taskBodyInput.value)
