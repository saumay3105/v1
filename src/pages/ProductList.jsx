import { Link } from "react-router-dom";
import { data } from "../utils/database";

export default function ProductList() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-12 tracking-wide text-gray-800">
        Luxe Collection
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
        {data.map((product) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="group bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl transition border border-gray-100"
          >
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover group-hover:scale-105 duration-300"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {product.name}
              </h2>
              <p className="text-gray-500">${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
