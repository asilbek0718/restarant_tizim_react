import api from '../api/axiosInstance';
import useMenuStore from '@/store/menu/menuStore';
let hasLoggedFallbackWarning = false;

/**
 * Professional Menu Service
 */
class MenuService {
  constructor() {
    this.fetchMenuItems = this.fetchMenuItems.bind(this);
    this.fetchCategories = this.fetchCategories.bind(this);
    this.createMenuItem = this.createMenuItem.bind(this);
    this.updateMenuItem = this.updateMenuItem.bind(this);
    this.deleteMenuItem = this.deleteMenuItem.bind(this);
  }
  /**
   * Fetches all menu items
   */
  async fetchMenuItems(params = {}) {
    try {
      const response = await api.get('/menu', { params });
      const items = response?.data || response || [];
      useMenuStore.getState().setItems(items);
      return items;
    } catch (error) {
      return useMenuStore.getState().items || [];
    }
  }

  /**
   * Fetches all categories
   */
  async fetchCategories() {
    try {
      const response = await api.get('/menu/categories');
      const categories = response?.data || response || [];
      useMenuStore.getState().setCategories(categories);
      return categories;
    } catch (error) {
      return useMenuStore.getState().categories || [];
    }
  }

  /**
   * Creates a new category
   */
  async createCategory(categoryData) {
    try {
      const response = await api.post('/menu/categories', categoryData);
      useMenuStore.getState().addCategory(response.data);
      return response.data;
    } catch (error) {
      return useMenuStore.getState().addCategory(categoryData);
    }
  }

  /**
   * Updates an existing category
   */
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/menu/categories/${id}`, categoryData);
      useMenuStore.getState().updateCategory(id, response.data);
      return response.data;
    } catch (error) {
      return useMenuStore.getState().updateCategory(id, categoryData);
    }
  }

  /**
   * Deletes a category
   */
  async deleteCategory(id) {
    try {
      await api.delete(`/menu/categories/${id}`);
      useMenuStore.getState().deleteCategory(id);
    } catch (error) {
      useMenuStore.getState().deleteCategory(id);
    }
  }

  /**
   * Creates a new menu item
   */
  async createMenuItem(itemData) {
    try {
      const response = await api.post('/menu', itemData);
      useMenuStore.getState().addItem(response.data);
      return response.data;
    } catch (error) {
      return useMenuStore.getState().addItem(itemData);
    }
  }

  /**
   * Updates an existing menu item
   */
  async updateMenuItem(id, itemData) {
    try {
      const response = await api.put(`/menu/${id}`, itemData);
      useMenuStore.getState().updateItem(id, response.data);
      return response.data;
    } catch (error) {
      return useMenuStore.getState().updateItem(id, itemData);
    }
  }

  /**
   * Deletes a menu item
   */
  async deleteMenuItem(id) {
    try {
      await api.delete(`/menu/${id}`);
      useMenuStore.getState().deleteItem(id);
    } catch (error) {
      useMenuStore.getState().deleteItem(id);
    }
  }
}

export const menuService = new MenuService();
