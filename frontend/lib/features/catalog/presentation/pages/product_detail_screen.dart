import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/product_detail/product_detail_bloc.dart';
import '../bloc/product_detail/product_detail_event.dart';
import '../bloc/product_detail/product_detail_state.dart';
import '../../../../models/product.dart';
import '../../data/repositories/catalog_repository.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _quantity = 1;
  int _currentImageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ProductDetailBloc(catalogRepository: CatalogRepositoryImpl())
        ..add(ProductDetailFetched(widget.productId)),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Detalle'),
          actions: [
            IconButton(
              icon: const Icon(Icons.shopping_cart_outlined),
              onPressed: () {},
            ),
          ],
        ),
        body: BlocBuilder<ProductDetailBloc, ProductDetailState>(
          builder: (context, state) {
            if (state is ProductDetailLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is ProductDetailError) {
              return Center(child: Text('Error: ${state.message}'));
            }
            if (state is ProductDetailLoaded) {
              return _ProductContent(
                product: state.product,
                quantity: _quantity,
                currentImageIndex: _currentImageIndex,
                onQuantityChanged: (q) => setState(() => _quantity = q),
                onImageChanged: (i) => setState(() => _currentImageIndex = i),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}

class _ProductContent extends StatelessWidget {
  final Product product;
  final int quantity;
  final int currentImageIndex;
  final ValueChanged<int> onQuantityChanged;
  final ValueChanged<int> onImageChanged;

  const _ProductContent({
    required this.product,
    required this.quantity,
    required this.currentImageIndex,
    required this.onQuantityChanged,
    required this.onImageChanged,
  });

  @override
  Widget build(BuildContext context) {
    final images = product.images;
    final hasImages = images.isNotEmpty;

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image carousel
                if (hasImages)
                  AspectRatio(
                    aspectRatio: 1,
                    child: PageView.builder(
                      itemCount: images.length,
                      onPageChanged: onImageChanged,
                      itemBuilder: (context, index) {
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            'http://localhost:3000${images[index].url}',
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.image_not_supported)),
                          ),
                        );
                      },
                    ),
                  )
                else
                  AspectRatio(
                    aspectRatio: 1,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(child: Icon(Icons.image_not_supported, size: 64)),
                    ),
                  ),

                const SizedBox(height: 8),

                // Dots indicator
                if (hasImages && images.length > 1)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(images.length, (index) {
                      return Container(
                        width: 8,
                        height: 8,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: currentImageIndex == index
                              ? Theme.of(context).colorScheme.primary
                              : Colors.grey.shade300,
                        ),
                      );
                    }),
                  ),

                const SizedBox(height: 16),

                // Category badge
                if (product.category != null)
                  Chip(
                    label: Text(product.category!.name),
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  ),

                const SizedBox(height: 8),

                // Name
                Text(
                  product.name,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),

                const SizedBox(height: 8),

                // Price
                Text(
                  '\u20AC${product.price.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),

                const SizedBox(height: 16),

                // Description
                Text(
                  product.description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey.shade700,
                      ),
                ),

                const SizedBox(height: 16),

                // Stock
                Text(
                  'Stock disponible: ${product.stock}',
                  style: TextStyle(color: Colors.grey.shade600),
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),

        // Bottom bar: quantity + add to cart
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            child: Row(
              children: [
                // Quantity selector
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove),
                        onPressed: quantity > 1 ? () => onQuantityChanged(quantity - 1) : null,
                      ),
                      Text('$quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: quantity < product.stock ? () => onQuantityChanged(quantity + 1) : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: product.isActive && product.stock > 0
                        ? () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Agregado $quantity x ${product.name} al carrito'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          }
                        : null,
                    icon: const Icon(Icons.shopping_cart),
                    label: const Text('Agregar al carrito'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
