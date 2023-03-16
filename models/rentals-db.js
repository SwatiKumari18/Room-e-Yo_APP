const rentals = [
    {
        headline: "St. Claire-Yonge",
        numSleeps: 4,
        numBedrooms: 3,
        numBathrooms: 2,
        pricePerNight: 120,
        city: 'Kitchener',
        province: 'Ontario',
        imageUrl: 'rental-image-1.jpg',
        featuredRental: true
    },
    {
        headline: 'Pure Bliss Street',
        numSleeps: 5,
        numBedrooms: 4,
        numBathrooms: 2,
        pricePerNight: 140,
        city: 'Kitchener',
        province: 'Ontario',
        imageUrl: 'rental-image-2.jpg',
        featuredRental: true
    },
    {
        headline: 'Beverly Hills Pathway',
        numSleeps: 2,
        numBedrooms: 1,
        numBathrooms: 2,
        pricePerNight: 100,
        city: 'Toronto',
        province: 'Ontario',
        imageUrl: 'rental-image-3.jpg',
        featuredRental: true
    },
    {
        headline: 'Casa Loma',
        numSleeps: 4,
        numBedrooms: 3,
        numBathrooms: 2,
        pricePerNight: 250,
        city: 'Toronto',
        province: 'Ontario',
        imageUrl: 'rental-image-4.jpg',
        featuredRental: false
    },
    {
        headline: 'Annex Crescent',
        numSleeps: 8,
        numBedrooms: 6,
        numBathrooms: 8,
        pricePerNight: 375,
        city: 'Kitchener',
        province: 'Ontario',
        imageUrl: 'rental-image-5.jpg',
        featuredRental: false
    },
    {
        headline: 'Willowdale West',
        numSleeps: 2,
        numBedrooms: 1,
        numBathrooms: 2,
        pricePerNight: 200,
        city: 'Toronto',
        province: 'Ontario',
        imageUrl: 'rental-image-6.jpg',
        featuredRental: false
    },
    {
        headline: 'Kingsway North',
        numSleeps: 5,
        numBedrooms: 4,
        numBathrooms: 6,
        pricePerNight: 250,
        city: 'Kitchener',
        province: 'Ontario',
        imageUrl: 'rental-image-7.jpg',
        featuredRental: false
    },
    {
        headline: 'Leaside South',
        numSleeps: 4,
        numBedrooms: 3,
        numBathrooms: 5,
        pricePerNight: 275,
        city: 'Kitchener',
        province: 'Ontario',
        imageUrl: 'rental-image-8.jpg',
        featuredRental: false
    }
];

//Returns all the rentals to be featured on the Home page
module.exports.getFeaturedRentals= function()
{
    let featuredRentals = [];

    for(let i = 0; i < rentals.length; i++)
    {
        if (rentals[i].featuredRental)
        {
            featuredRentals.push(rentals[i]);
        }
    }

    return featuredRentals;
};


//Returns all the rentals grouped by city & province together
module.exports.getRentalsByCityAndProvince= function()
{
    let groupedRentals = [];
    let cityProvinceList = [];
    
    //All the possible list of city and province combination
    for(let i = 0; i < rentals.length; i++)
    {
        let cityProvinceCombination = rentals[i].city + ', ' + rentals[i].province;

        if(cityProvinceList.length === 0)
        {
            cityProvinceList.push(cityProvinceCombination);
        }
        else
        {
            let isUnique = true;

            for(let j = 0; j < cityProvinceList.length && isUnique; j++)
            {
                if (cityProvinceList[j] === cityProvinceCombination)
                {
                    isUnique = false;
                }
               
            }

            if(isUnique)
            {
                cityProvinceList.push(cityProvinceCombination);
            }


        }
    }

    for(let i = 0; i < cityProvinceList.length; i++)
    {
        let sameRentals = [];
        let cityProvinceAndRental =
        { cityProvince : "", rentals: []};

        for(let j = 0; j < rentals.length; j++)
        {
            var cityProvinceCombination = rentals[j].city + ', ' + rentals[j].province;

            if (cityProvinceList[i] === cityProvinceCombination)
            {
                sameRentals.push(rentals[j]);
            }
        }

        cityProvinceAndRental.cityProvince = cityProvinceList[i];
        cityProvinceAndRental.rentals = sameRentals;

        groupedRentals.push(cityProvinceAndRental);

        sameRentals = [];

    }

    return groupedRentals;
};