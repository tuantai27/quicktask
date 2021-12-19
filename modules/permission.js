const { AbilityBuilder } =  require('@casl/ability');
const { pageType } =  require('./typePermission');
const out = {};

out.getRole = (roleName) => {
    const roles = [
        {
            role        : 'admin',
            item        : 'page',
            permit      : 'allow',
            operation   : 'manage',
            conditions  : {
                name : {
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
            role        : 'manage',
            item        : 'page',
            permit      : 'allow',
            operation   : 'manage',
            conditions  : {
                name : {
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
                name : {
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

out.buildPermisison = (roles) => {
    const permisisons = AbilityBuilder.define(function(allow, deny) {
        for (let i = 0; i < roles.length; i++) {
            const role = roles[i];

            if (role.permit === 'allow') {
                allow(role.operation, role.item, role.conditions);
            } else {
                deny(role,operation, role.item, role.conditions);
            }
            
        }
    });
    return permisisons;
}

out.getPages = (permission) => {
    const pages = [
        {
            name : 'home',
            url  : './form?page=hrm',
            html : 'Home'
        },
        {
            name : 'salary',
            url  : './Salary',
            html : 'Salary'
        },
        {
            name : 'excel',
            url  : './excel',
            html : 'Excel'
        },
        {
            name : 'categories',
            url  : './categories',
            html : 'Categories'
        },
        {
            name : 'roles',
            url  : './roles',
            html : 'Roles'
        },
        {
            name : 'users',
            url  : './users',
            html : 'Users'
        }
    ];

    const arr = [];

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (permission.can('view', new pageType(page.name))) {
            arr.push(page);
        }
    }

    return arr;
}



module.exports = out;