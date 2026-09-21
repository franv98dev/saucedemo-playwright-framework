import { type Locator, type Page } from '@playwright/test';

import { type Product } from '../data/products';
import { parsePrice } from '../utils/price';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';

  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly activeSortOption: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.activeSortOption = page.getByTestId('active-option');
  }

  /** Card of a single product, located by its visible name. */
  item(product: Product): Locator {
    return this.items.filter({ has: this.page.getByText(product.name, { exact: true }) });
  }

  addToCartButton(product: Product): Locator {
    return this.page.getByTestId(`add-to-cart-${product.slug}`);
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  async addToCart(...products: Product[]): Promise<void> {
    for (const product of products) {
      await this.addToCartButton(product).click();
    }
  }

  async removeFromCart(...products: Product[]): Promise<void> {
    for (const product of products) {
      await this.removeButton(product).click();
    }
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async openProduct(product: Product): Promise<void> {
    await this.item(product).getByTestId('inventory-item-name').click();
  }

  async getProductNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map(parsePrice);
  }
}
