const Contact = require('./schemas/contact');

async function listContacts(
  userId,
  { sortBy, sortByDesc, filter, limit = '5', page = '1' },
) {
  console.log(userId);
  const results = await Contact.paginate(
    { owner: userId },
    {
      limit,
      page,
      sort: {
        ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
        ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
      },
      select: filter ? filter.split('|').join(' ') : '',
      populate: {
        path: 'owner',
        select: 'name email -_id',
      },
    },
  );

  const { docs: contacts, totalDocs: total } = results;
  return { total: total.toString(), limit, page, contacts };
}


async function getContactById(contactId, userId) {
  const result = await Contact.findOne({
    _id: contactId,
    owner: userId,
  }).populate({
    path: 'owner',
    select: 'email -_id',
  });
  return result;
}

async function addContact(body) {
  const result = await Contact.create(body);
  return result;
}

async function removeContact(contactId, userId) {
  const result = await Contact.findByIdAndDelete({
    _id: contactId,
    owner: userId,
  }).populate({
    path: 'owner',
    select: 'email -_id',
  });
  return result;
}

async function updateContact(contactId, reqBody, userId) {
  const result = await Contact.findByIdAndUpdate(
    { _id: contactId, owner: userId },
    { ...reqBody },
    { new: true },
  ).populate({
    path: 'owner',
    select: 'email -_id',
  });
  return result;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

