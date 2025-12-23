const BasePage = require('./BasePage');

/**
 * ListPage - Page Object for List/Task screen
 *
 * Handles list interactions including:
 * - List filtering (all, pending, in-progress, completed)
 * - Item interactions
 * - Item count verification
 * - Scrolling behavior
 */
class ListPage extends BasePage {
  constructor(driver, platform) {
    super(driver, platform);
  }

  // Locators
  get backButton() {
    return this.findElement('back-button');
  }

  get taskList() {
    return this.findElement('task-list');
  }

  get filterAll() {
    return this.findElement('filter-all');
  }

  get filterPending() {
    return this.findElement('filter-pending');
  }

  get filterInProgress() {
    return this.findElement('filter-in-progress');
  }

  get filterCompleted() {
    return this.findElement('filter-completed');
  }

  async getListItem(itemId) {
    return this.findElement(`list-item-${itemId}`);
  }

  // Actions
  async waitForPageLoad() {
    await this.waitForElement('task-list', 10000);
    console.log('✅ List page loaded');
  }

  async verifyOnListPage() {
    const taskList = await this.taskList;
    const isDisplayed = await taskList.isDisplayed();
    if (!isDisplayed) {
      throw new Error('Not on List page');
    }
  }

  async clickBack() {
    const button = await this.backButton;
    await button.click();
    console.log('   Clicked back button');
    await this.pause(500);
  }

  async selectFilter(filterType) {
    let filterButton;

    switch (filterType.toLowerCase()) {
      case 'all':
        filterButton = await this.filterAll;
        break;
      case 'pending':
        filterButton = await this.filterPending;
        break;
      case 'in-progress':
        filterButton = await this.filterInProgress;
        break;
      case 'completed':
        filterButton = await this.filterCompleted;
        break;
      default:
        throw new Error(`Unknown filter type: ${filterType}`);
    }

    await filterButton.click();
    console.log(`   Selected filter: ${filterType}`);
    await this.pause(500);
  }

  async clickListItem(itemId) {
    const item = await this.getListItem(itemId);
    await item.click();
    console.log(`   Clicked list item: ${itemId}`);
    await this.pause(1000);
  }

  async isListItemDisplayed(itemId) {
    try {
      const item = await this.getListItem(itemId);
      return await item.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  async getVisibleListItems() {
    // Get all list items by checking testID pattern
    const items = [];
    for (let i = 1; i <= 10; i++) {
      const isVisible = await this.isListItemDisplayed(i.toString());
      if (isVisible) {
        items.push(i.toString());
      }
    }
    return items;
  }

  async getItemCount() {
    const visibleItems = await this.getVisibleListItems();
    return visibleItems.length;
  }

  async verifyItemCount(expectedCount) {
    const actualCount = await this.getItemCount();
    if (actualCount !== expectedCount) {
      throw new Error(`Item count mismatch: expected ${expectedCount}, got ${actualCount}`);
    }
    console.log(`✅ Verified item count: ${actualCount}`);
  }

  async verifyFilteredItems(filterType, expectedItems) {
    await this.selectFilter(filterType);
    await this.pause(500);

    const visibleItems = await this.getVisibleListItems();

    console.log(`   Visible items after filter (${filterType}):`, visibleItems);
    console.log(`   Expected items:`, expectedItems);

    if (visibleItems.length !== expectedItems.length) {
      throw new Error(
        `Filter verification failed for "${filterType}": expected ${expectedItems.length} items, got ${visibleItems.length}`
      );
    }

    console.log(`✅ Filter "${filterType}" verified: ${visibleItems.length} items`);
  }

  async scrollToItem(itemId) {
    const item = await this.getListItem(itemId);

    // Try to scroll item into view
    try {
      await this.driver.execute('mobile: scroll', { element: item, direction: 'down' });
      console.log(`   Scrolled to item: ${itemId}`);
    } catch (e) {
      // Item might already be visible
      console.log(`   Item ${itemId} already visible`);
    }

    await this.pause(500);
  }

  async dismissAlert() {
    // Handle platform-specific alert dismissal
    if (this.platform === 'android') {
      try {
        await this.driver.acceptAlert();
      } catch (e) {
        // Alert might not be present
      }
    } else if (this.platform === 'ios') {
      try {
        const okButton = await this.driver.$('~OK');
        if (await okButton.isExisting()) {
          await okButton.click();
        }
      } catch (e) {
        // Alert might not be present
      }
    }
    await this.pause(500);
  }

  async testAllFilters() {
    console.log('🧪 Testing all filters...');

    // Test "All" filter - should show all 10 items
    await this.selectFilter('all');
    await this.pause(500);
    const allCount = await this.getItemCount();
    console.log(`   All filter: ${allCount} items`);

    // Test "Pending" filter
    await this.selectFilter('pending');
    await this.pause(500);
    const pendingCount = await this.getItemCount();
    console.log(`   Pending filter: ${pendingCount} items`);

    // Test "In Progress" filter
    await this.selectFilter('in-progress');
    await this.pause(500);
    const inProgressCount = await this.getItemCount();
    console.log(`   In-progress filter: ${inProgressCount} items`);

    // Test "Completed" filter
    await this.selectFilter('completed');
    await this.pause(500);
    const completedCount = await this.getItemCount();
    console.log(`   Completed filter: ${completedCount} items`);

    console.log(`✅ All filters tested: ${allCount} total (${pendingCount} pending, ${inProgressCount} in-progress, ${completedCount} completed)`);

    return {
      all: allCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
    };
  }
}

module.exports = ListPage;
