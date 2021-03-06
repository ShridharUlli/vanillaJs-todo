class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
  }
  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }
  _commit(todos) {
    this.onTodoListChanged(todos);
    localStorage.setItem("todos", JSON.stringify(todos));
  }
  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false,
    };

    this.todos.push(todo);
    this._commit(this.todos);
  }

  editTodo(id, updatedText) {
    this.todos = this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: updatedText, complete: todo.complete }
        : todo
    );
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id != id);
    this._commit(this.todos);
  }

  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: todo.text, complete: !todo.complete }
        : todo
    );
    this._commit(this.todos);
  }
}

class View {
  constructor() {
    this.app = this.getElement("#root");
    this.app.classList.add("m-4");

    this.title = this.createElement("h1");
    this.title.textContent = "📝 Todos";
    this.title.classList.add("text-4xl", "text-blue-700", "font-bold", "mb-5");

    this.form = this.createElement("form");

    this.input = this.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "Add Todo";
    this.input.name = "todo";
    this.input.maxLength = "100";
    this.input.classList.add("bg-blue-100", "px-5", "py-3");

    this.submitButton = this.createElement("button");
    this.submitButton.textContent = "Submit";
    this.submitButton.classList.add(
      "bg-blue-700",
      "px-5",
      "py-3",
      "text-gray-100"
    );

    this.todoList = this.createElement("ul", "todo-list");

    this.form.append(this.input, this.submitButton);
    this.app.append(this.title, this.form, this.todoList);

    this._temporaryTodoText;
    this._initLocalListeners();
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    return element;
  }

  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  }

  get _todoText() {
    return this.input.value;
  }
  _resetInput() {
    this.input.value = "";
  }
  displayTodos(todos) {
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }
    if (todos.length === 0) {
      const p = this.createElement("p");
      p.textContent = "Nothing to do, Add a task?";
      p.classList.add("mt-5");
      this.todoList.append(p);
    } else {
      todos.forEach((todo) => {
        const li = this.createElement("li");
        li.id = todo.id;
        li.classList.add("pt-2");

        const checkbox = this.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.complete;

        const span = this.createElement("span");
        span.contentEditable = true;
        span.classList.add(
          "editable",
          "bg-blue-100",
          "appearance-none",
          "border-2",
          "border-gray-100",
          "w-full",
          "py-2",
          "px-4",
          "ml-2",
          "text-gray-700",
          "leading-tight"
        );

        if (todo.complete) {
          const strike = this.createElement("s");
          strike.textContent = todo.text;
          span.append(strike);
        } else {
          span.textContent = todo.text;
        }

        const deleteButton = this.createElement("button", "delete");
        deleteButton.textContent = "X";
        deleteButton.classList.add(
          "bg-red-600",
          "appearance-none",
          "border-2",
          "border-red-600",
          "py-2",
          "px-4",
          "text-gray-100",
          "leading-tight",
          "font-bold"
        );
        li.append(checkbox, span, deleteButton);
        this.todoList.append(li);
      });
    }
  }
  bindAddTodo(handler) {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (this._todoText) {
        handler(this._todoText);
        this._resetInput();
      }
    });
  }
  // Update temporary state
  _initLocalListeners() {
    this.todoList.addEventListener("input", (event) => {
      if (event.target.classList.contains("editable")) {
        this._temporaryTodoText = event.target.innerText;
      }
    });
  }

  // Send the completed value to the model
  bindEditTodo(handler) {
    this.todoList.addEventListener("focusout", (event) => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id);

        handler(id, this._temporaryTodoText);
        this._temporaryTodoText = "";
      }
    });
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener("click", (event) => {
      if (event.target.classList.contains("delete")) {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);
    this.view.bindEditTodo(this.handleEditTodo);

    this.onTodoListChanged(this.model.todos);
  }

  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos);
  };

  handleAddTodo = (todoText) => {
    this.model.addTodo(todoText);
  };
  handleEditTodo = (id, todoText) => {
    this.model.editTodo(id, todoText);
  };
  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id);
  };
  handleToggleTodo = (id) => {
    this.model.toggleTodo(id);
  };
}

const app = new Controller(new Model(), new View());
