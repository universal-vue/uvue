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
              :to="item.testPath || item.path"
              :data-route-name="item.testName || item.name"
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

<style>
.side-menu ul {
  list-style: none;
  list-style-image: none;
  margin: 0;
  padding: 0;
}

.side-menu ul li {
  list-style: none;
  list-style-image: none;
  margin: 0;
  padding: 0;
}

.side-menu > ul > li > span {
  font-size: 1.05em;
  font-weight: bold;
  text-transform: uppercase;
  display: block;
  padding: 10px 0;
}

.side-menu ul ul li {
  padding: 5px;
  padding-left: 20px;
}

.side-menu ul ul li a {
  color: #666;
  text-decoration: none;
}

.side-menu ul ul li a.router-link-exact-active {
  color: #000;
}
</style>
