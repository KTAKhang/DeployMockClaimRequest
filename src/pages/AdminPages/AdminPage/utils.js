export const filterProjectsByStatus = (projects) => {
  return {
    completedProjects: projects.filter((p) => p.status === true).length,
    inProgressProjects: projects.filter((p) => p.status === false).length,
  };
};

export const calculatePagination = (totalItems, currentPage, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    totalPages,
    startIndex,
    endIndex,
  };
};

export const paginateItems = (items, currentPage, itemsPerPage) => {
  const { startIndex, endIndex } = calculatePagination(
    items.length,
    currentPage,
    itemsPerPage
  );

  let paginatedItems = items.slice(startIndex, endIndex);

  // Fill remaining slots if needed
  while (paginatedItems.length < itemsPerPage) {
    paginatedItems.push(null);
  }

  return paginatedItems;
};

export const truncateText = (text, maxLength = 20) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};
