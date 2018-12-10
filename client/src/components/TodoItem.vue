<template>
  <li
    class="todo"
    :key="todo.id"
    :class="{ completed: todo.completed, editing: todo == editedTodo }"
  >
    <div class="view">
      <input
        class="toggle"
        type="checkbox"
        v-model="todo.completed"
        @click="toggleCompleted"
      />
      <label @dblclick="editTodo">{{ todo.title }}</label>
      <button class="destroy" @click="$emit('remove-todo', todo);"></button>
    </div>
    <input
      class="edit"
      type="text"
      v-model="todo.title"
      v-todo-focus="todo == editedTodo"
      @blur="doneEdit"
      @keyup.enter="doneEdit"
      @keyup.esc="cancelEdit"
    />
  </li>
</template>

<script>
export default {
  props: ['todo'],
  data: function() {
    return {
      editedTodo: null,
    };
  },
  watch: {},
  methods: {
    editTodo: function() {
      this.beforeEditCache = this.todo.title;
      this.editedTodo = this.todo;
    },

    doneEdit: function() {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      this.todo.title = this.todo.title.trim();
      if (!this.todo.title) {
        this.$emit('remove-todo', this.todo);
      } else {
        const title = this.todo.title;
        fetch(`/api/tasks/${this.todo.task_id}`, {
          headers,
          method: 'PATCH',
          body: JSON.stringify({ title }),
        })
          .then(res => res.json())
          .then(data => {
            console.log(JSON.stringify(data));
            Object.assign(this.todo, data);
          });
      }
    },

    cancelEdit: function() {
      this.editedTodo = null;
      this.todo.title = this.beforeEditCache;
    },

    toggleCompleted: function() {
      const completed = !this.todo.completed;
      this.todo.update_time = new Date().toISOString();
      fetch(`/api/tasks/${this.todo.task_id}`, {
        headers,
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      })
        .then(res => res.json())
        .then(data => {
          console.log(JSON.stringify(data));
          Object.assign(this.todo, data);
        });
    },
  },
  directives: {
    'todo-focus': function(el, binding) {
      if (binding.value) {
        el.focus();
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.edit {
  position: relative;
  margin: 0;
  width: 100%;
  font-size: 24px;
  font-family: inherit;
  font-weight: inherit;
  line-height: 1.4em;
  border: 0;
  color: inherit;
  padding: 6px;
  border: 1px solid #999;
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
