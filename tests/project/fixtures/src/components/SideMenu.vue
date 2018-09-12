<template>
  <div class="side-menu">

    <ul class="categories">
      <li
        v-for="(category, index) in views"
        :key="index"
        class="category"
      >
        <span>{{ category.label }}</span>

        <ul class="links">
          <li
            v-for="(item, index) in category.children"
            :key="index"
            class="link"
          >
            <router-link
              :to="item.path"
              :data-route-name="item.name"
            >
              {{ item.label }}
            </router-link>
          </li>
        </ul>

      </li>
    </ul>

  </div>
</template>

<script>
import views from '@/shared/views';

export default {
  data: () => ({
    views,
  }),
};
</script>

