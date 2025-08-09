import { useParams, Link } from "react-router-dom";
import { data } from "../utils/database";

export default function ProductDetail() {
  const { id } = useParams();
  const product = data.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          ← Back to Collection
        </Link>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div className="flex flex-col gap-4">
            {product.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${product.name} view ${i + 1}`}
                className="rounded-xl shadow-sm border border-gray-100"
              />
            ))}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-semibold text-gray-700">
              ${product.price}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.length > 0 ? (
                    product.sizes.map((size) => (
                      <span
                        key={size}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 text-sm"
                      >
                        {size}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Colors</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <span
                      key={color}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 text-sm"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Material: {product.material}
            </p>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            <p className="text-sm text-gray-500">
              Stock: {product.stock} available
            </p>

            <button className="mt-4 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
