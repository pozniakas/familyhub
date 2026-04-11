/** Default seed data — used on first load when localStorage is empty */
export const DEFAULT_DATA = {
  entities: [
    {
      id: 'home',
      name: 'Home',
      emoji: '🏠',
      categories: [
        { id: 'maintenance', name: 'Maintenance' },
        { id: 'renovation',  name: 'Renovation' },
        { id: 'appliances',  name: 'Appliances' },
        { id: 'garden',      name: 'Garden & Exterior' },
      ],
    },
    {
      id: 'car',
      name: 'Car',
      emoji: '🚗',
      categories: [
        { id: 'repairs',   name: 'Repairs' },
        { id: 'comfort',   name: 'Comfort & Aesthetics' },
        { id: 'service',   name: 'Service' },
        { id: 'documents', name: 'Documents & Insurance' },
      ],
    },
    {
      id: 'investments',
      name: 'Investments',
      emoji: '📈',
      categories: [
        { id: 'stocks',      name: 'Stocks' },
        { id: 'real-estate', name: 'Real Estate' },
        { id: 'savings',     name: 'Savings' },
      ],
    },
  ],
  items: [
    { id: 'i1', entityId: 'home',        categoryId: 'maintenance', name: 'Roof inspection',    status: 'urgent', notes: 'Due this spring' },
    { id: 'i2', entityId: 'home',        categoryId: 'appliances',  name: 'Dishwasher',         status: 'ok',     notes: '' },
    { id: 'i3', entityId: 'home',        categoryId: 'appliances',  name: 'Washing machine',    status: 'soon',   notes: 'Making a grinding noise' },
    { id: 'i4', entityId: 'car',         categoryId: 'service',     name: 'Oil change',         status: 'soon',   notes: 'Due in ~2 000 km' },
    { id: 'i5', entityId: 'car',         categoryId: 'documents',   name: 'Insurance',          status: 'ok',     notes: 'Renewed until Dec 2026' },
    { id: 'i6', entityId: 'investments', categoryId: 'savings',     name: 'Emergency fund',     status: 'ok',     notes: '3 months covered' },
  ],
  tasks: [
    { id: 't1', name: 'Book a roof inspector',          entityId: 'home', priority: 'high',   done: false, assignedTo: '', dueDate: null },
    { id: 't2', name: 'Schedule oil change',            entityId: 'car',  priority: 'medium', done: false, assignedTo: '', dueDate: null },
    { id: 't3', name: 'Check washing machine warranty', entityId: 'home', priority: 'low',    done: false, assignedTo: '', dueDate: null },
  ],
};
