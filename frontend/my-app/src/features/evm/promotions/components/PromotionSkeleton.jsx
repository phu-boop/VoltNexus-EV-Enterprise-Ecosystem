import React from "react";

const PromotionSkeleton = () => (
  <>
    {[...Array(5)].map((_, index) => (
      <tr key={index} className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="flex items-center space-x-4">
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-1">
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="h-8 bg-gray-200 rounded w-24 ml-auto animate-pulse"></div>
        </td>
      </tr>
    ))}
  </>
);

export default PromotionSkeleton;