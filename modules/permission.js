const out = {};

out.getRole = (roleName) => {
    const roles = [
        {
            role        : 'Admin',
            item        : 'page',
            permit      : 'allow',
            operation   : 'manage',
            conditions  : {
                type : 'page',
                page : {
                    "$in" : [
                        'home',
                        'salary',
                        'excel',
                        'categories',
                        'users',
                        'roles'
                    ]
                }
            }
        },
        {
            role        : 'Manage',
            item        : 'page',
            permit      : 'allow',
            operation   : 'manage',
            conditions  : {
                type : 'page',
                page : {
                    "$in" : [
                        'home',
                        'salary',
                        'excel'
                    ]
                }
            }
        },
        {
            role        : 'support',
            item        : 'page',
            permit      : 'allow',
            operation   : 'manage',
            conditions  : {
                type : 'page',
                page : {
                    "$in" : [
                        'excel'
                    ]
                }
            }
        }
    ];

    const arrRole = [];

    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        if (role.role === roleName) {
            arrRole.push(role);
        }
    }

    return arrRole;
}

module.exports = out;